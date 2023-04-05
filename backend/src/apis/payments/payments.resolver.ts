import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { IContext } from 'src/commons/type/context';
import { IamportService } from '../iamport/iamport.service';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';

@Resolver()
export class PaymentResolver {
  constructor(
    private readonly paymentService: PaymentService, //
    private readonly iamportService: IamportService,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Payment)
  async createPayment(
    @Args('impUid') impUid: string,
    @Args({ name: 'amount', type: () => Int }) amount: number,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    //이미 결제가 된 데이터 인지 확인하기
    await this.paymentService.checkPayment({ impUid });
    //결제 정보 토큰 받아오기
    const getToken = await this.iamportService.getToken();
    //토큰 정보에 들어있는 결제 정보 가져오기
    const getPaymentData = await this.iamportService.getPaymentData({
      impUid,
      getToken,
    });
    //생성하려는 결제정보랑 토큰에 들어있는 결제 정보랑 같은지 검증하기.
    await this.paymentService.validate({
      impUid,
      amount,
      getPaymentData,
    });
    return this.paymentService.create({ impUid, amount, user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Payment)
  async cancelPayment(
    @Args('impUid') impUid: string, //
    @Args('reason') reason: string,
    @Args({ name: 'amount', type: () => Int }) amount: number,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    //이미 취소한 데이터인지 확인하기
    const payment = await this.paymentService.checkCancel({ impUid });
    //취소하려는 금액이 유저에 저장되어있는 cash보다 많은지 확인하기
    await this.paymentService.checkCash({ user, amount });
    //토큰 받기
    const access_token = await this.iamportService.getToken();
    //결제취소 요청하기
    const getCancelData = await this.iamportService.getCancelData({
      access_token,
      payment,
      reason,
    });
    //결제취소 생성하고 해당 데이터 클라이언트에게 반환하기.
    return this.paymentService.cancel({ getCancelData, user });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async usePoint(
    @Args({ name: 'amount', type: () => Int }) amount: number, //
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    await this.paymentService.checkCash({ user, amount });
  }

  cancelPoint() {
    return;
  }
}
