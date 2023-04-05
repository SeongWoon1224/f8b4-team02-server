import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { getDate, getToday } from 'src/commons/utils/utils';
import { Repository } from 'typeorm';
import { Income } from '../incomes/entities/incomes.entity';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  async find({ email, order }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return this.reservationRepository.find({
      where: { user: { userID: user.userID } },
      relations: ['store', 'store.storeImg', 'store.pet', 'store.storeTag'],
      withDeleted: true,
      order: { createAt: order },
    });
  }

  async findCancel({ email }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    const reservationData = await this.reservationRepository.find({
      where: {
        user: { userID: user.userID },
      },
      relations: ['store', 'store.storeImg', 'store.pet', 'store.storeTag'],
      withDeleted: true,
    });
    const result = [];
    for (let i = 0; i < reservationData.length; i++) {
      if (reservationData[i].deletedAt !== null)
        result.push(reservationData[i]);
    }
    return result;
  }

  async create({ createReservationInput, email, storeID }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    const point = user.point - createReservationInput.amount;
    this.userRepository.save({
      ...user,
      point,
    });

    const store = await this.storeRepository.findOne({
      where: { storeID },
    });

    //수입내역 수정하기 createReservationInput.amount
    const cash = createReservationInput.amount;
    const income = await this.writeIncome({ cash, store });

    const date = getToday();
    const result = await this.reservationRepository.save({
      ...createReservationInput,
      user: user,
      store: store,
      income: income,
      date: date,
    });
    return result;
  }

  async cancel({ email, storeID, date }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    const reservation = await this.reservationRepository.findOne({
      where: {
        user: { userID: user.userID },
        store: { storeID },
        date,
      },
      relations: ['user', 'store', 'income'],
    });

    if (!reservation) {
      throw new UnprocessableEntityException('예약 건이 존재하지 않습니다.');
    }

    //삭제 전에 res상태 바꾸고 삭제하기
    this.reservationRepository.save({
      ...reservation,
      state: 'CANCEL',
    });

    //필요한 변수 뽑기
    const amount = reservation.amount;
    const incomeID = reservation.income.incomeID;

    //유저에게 포인트 돌려주기
    this.userRepository.save({
      ...user,
      point: user.point + amount,
    });

    //income 결제취소건 반영하기
    this.deleteIncome({ incomeID, amount });

    const result = await this.reservationRepository.softDelete({
      user: { userID: user.userID },
      store: { storeID: storeID },
      date,
    });
    return result.affected ? true : false;
  }

  async writeIncome({ cash, store }) {
    const date: any = getDate();
    const income = await this.incomeRepository.findOne({
      where: {
        store: { storeID: store.storeID },
        date: date,
      },
      relations: ['store'],
    });

    if (!income) {
      return this.incomeRepository.save({
        date: date,
        paymentNum: 1,
        totalCash: cash,
        store,
      });
    } else {
      const incomeData = await this.incomeRepository.findOne({
        where: {
          date: date,
          store: { storeID: store.storeID },
        },
        relations: ['store'],
      });
      const totalCash = incomeData.totalCash + cash;
      const paymentNum = incomeData.paymentNum + 1;
      return this.incomeRepository.save({
        ...incomeData,
        date: date,
        paymentNum,
        totalCash,
      });
    }
  }

  async deleteIncome({ incomeID, amount }) {
    const incomeData = await this.incomeRepository.findOne({
      where: { incomeID },
      relations: ['store'],
    });

    const totalCash = incomeData.totalCash - amount;
    const cancelNum = incomeData.cancelNum + 1;

    const result = await this.incomeRepository.save({
      ...incomeData,
      totalCash,
      cancelNum,
    });

    return result;
  }

  async checkReservation({ email, storeID, date }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    const reservation = await this.reservationRepository.findOne({
      where: {
        store: { storeID },
        user: { userID: user.userID },
        date,
      },
    });
    if (!reservation) {
      throw new UnprocessableEntityException('예약 내역이 존재하지 않습니다.');
    }
  }

  async checkUserPoint({ email, createReservationInput }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user.point < createReservationInput.amount) {
      throw new UnprocessableEntityException(
        '결제 가능한 포인트가 부족합니다.',
      );
    }
  }

  async changeReservation({ resID }) {
    const reservation = await this.reservationRepository.findOne({
      where: { resID },
      relations: [
        'user',
        'store',
        'income',
        'store.storeImg',
        'store.pet',
        'store.storeTag',
      ],
    });
    if (!reservation) {
      throw new UnprocessableEntityException('예약 건이 존재하지 않습니다.');
    }
    //삭제 전에 res상태 바꾸고 삭제하기
    const result = await this.reservationRepository.save({
      ...reservation,
      state: 'USED',
    });
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  @Cron('1 1 * * *')
  async checkExpired() {
    const reservations = await this.reservationRepository.find();
    const today = getToday();

    reservations.map((reservation) => {
      //결제한 날짜 가져오기
      const ResDate = reservation.date;
      //결제한 날짜로부터 한달인 날보기
      let [year, month, date] = ResDate.split('-');
      if (Number(month) + 1 >= 12) {
        year = `${Number(year) + 1}`;
        month = `${Number(month) % 12}`;
        date = date;
      } else {
        month = `${Number(month) + 1}`;
      }
      const compareDate = [year, month, date].join('-');

      //만약 한달이 지난게 오늘이라면 state변경하고 삭제하기
      if (compareDate === today) {
        this.reservationRepository.save({
          ...reservation,
          state: 'EXPIRED',
        });

        this.reservationRepository.softDelete({
          resID: reservation.resID,
          store: { storeID: reservation.store.storeID },
        });
      }
    });
    return '데이터 확인 완료';
  }
}
