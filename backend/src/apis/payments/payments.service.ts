import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Payment, PAYMENT_ENUM } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly connection: Connection,
  ) {}

  async create({ impUid, amount, user: _user }) {
    //connect 생성하기
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    //transaction을 만들기
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      //1. payment 테이블에 거래기록 한줄 생성
      //유저 정보 불러오기
      const user = await queryRunner.manager.findOne(User, {
        where: { email: _user.email },
        lock: { mode: 'pessimistic_write' },
      });

      const payment = this.paymentRepository.create({
        impUid: impUid,
        amount: amount,
        user: user, //user,
        status: PAYMENT_ENUM.PAYMENT,
      });
      await queryRunner.manager.save(payment);

      const point = user.point + amount;
      //3.유저의 돈 업데이트->유저가 얼마를 가지고 있는지 알아야함! 그래야 돈 업데이트 가능~
      const updateUser = this.userRepository.create({
        ...user,
        point,
      });
      await queryRunner.manager.save(updateUser);

      //데이터 확정짓기
      await queryRunner.commitTransaction();

      //4.최종결과 프론트에 돌려주기
      return payment;
    } catch (error) {
      //에러 만나면 롤백하기
      await queryRunner.rollbackTransaction();
    } finally {
      //connection을 풀어주기
      await queryRunner.release();
    }
  }

  async cancel({ getCancelData, user: _user }) {
    //connect 생성하기
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    //transaction을 만들기
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      //1. 결제 취소정보 생성 후 저장하기
      const payment = this.paymentRepository.create({
        impUid: getCancelData.imp_uid,
        amount: -getCancelData.amount,
        user: _user,
        status: PAYMENT_ENUM.CANCEL,
      });

      //저장하기
      await queryRunner.manager.save(payment);

      //2. 유저의 돈찾아오기 이때, 락 걸기.
      const user = await queryRunner.manager.findOne(User, {
        where: { userID: _user.userID },
        lock: { mode: 'pessimistic_write' },
      });

      //취소된 정보 생성하기
      const updatedUser = this.userRepository.create({
        ...user,
        point: user.point - getCancelData.amount,
      });
      //취소 정보 저장
      await queryRunner.manager.save(updatedUser);

      //데이터 확정짓기
      await queryRunner.commitTransaction();

      //프론트에 최종값 돌려주기.
      return payment;
    } catch (error) {
      //에러 만나면 롤백하기
      await queryRunner.rollbackTransaction();
    } finally {
      //connection을 풀어주기
      await queryRunner.release();
    }
  }

  async checkPayment({ impUid }) {
    // 이미 payment table에 저장된 결제 정보 인지 검증
    const result = await this.paymentRepository.findOne({
      where: { impUid: impUid, status: PAYMENT_ENUM.PAYMENT },
    });
    if (result) throw new ConflictException('이미 결제가 완료되었습니다.');
  }

  async checkCash({ user: _user, amount }) {
    //1. 유저의 캐쉬 정보 가져오기
    const user = await this.userRepository.findOne({
      where: { userID: _user.userID },
    });
    //2. 취소하려는 금액과 캐쥐 잔액 비교하기.
    if (user.point < amount) {
      throw new UnprocessableEntityException('포인트가 부족합니다.');
    }
  }

  async checkCancel({ impUid }) {
    //1. 이미 결제가 취소되었는지 확인하기.
    //impUid로 결제건 불러오기.
    const payment = await this.paymentRepository.findOne({
      where: { impUid: impUid },
    });

    //2.결제 건이 없는 경우
    if (!payment) {
      throw new UnprocessableEntityException('결제 기록이 존재하지 않습니다.');
    }
    //2. 해당 정보에서 status가 CANCEL이면 예외처리
    if (payment.status === 'CANCEL') {
      throw new UnprocessableEntityException('이미 취소된 결제입니다.');
    }
    return payment;
  }

  //생성하려는 결제정보랑 토큰에 들어있는 결제 정보랑 같은지 검증하기.
  async validate({ impUid, amount, getPaymentData }) {
    //토큰을 통한 impUid랑 생성하려는 impUid와 동일한지 확인하기->정보를 불러오는데서 이미걸러짐.

    //결제한 건이 아닐경우
    if (getPaymentData.status !== 'paid') {
      throw new ConflictException('결제 내역이 존재하지 않습니다.');
    }

    //토큰을 통해 결제한 금액이랑 데이터베이스에 입력하려는 금액이 맞는지 확인하기
    if (amount !== getPaymentData.amount) {
      throw new UnprocessableEntityException(
        '결제하신 금액과 다른 금액입니다.',
      );
    }

    //이미 추가된 결제 건인지 확인하기 impUid가 하나만 조회되어야함.
    const payment = await this.paymentRepository.findOne({
      where: { impUid: impUid },
    });
    if (payment) {
      throw new ConflictException('이미 결제 되었습니다.');
    }
  }
}
