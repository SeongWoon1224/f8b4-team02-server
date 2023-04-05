import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CreateReservationInput } from './dto/createReservation.input';
import { Reservation } from './entities/reservation.entity';
import { ReservationsService } from './reservations.service';

@Resolver()
export class ReservationsResolver {
  constructor(
    private readonly reservationsService: ReservationsService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Reservation])
  fetchUserReservation(
    @Context() context: any, //
    @Args({ name: 'order', defaultValue: 'DESC', nullable: true })
    order: string,
  ) {
    const email = context.req.user.email;
    return this.reservationsService.find({ email, order });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Reservation])
  fetchCancelReservation(
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.reservationsService.findCancel({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Reservation, { description: '사용자가 예약하는 기능' })
  async createReservation(
    @Args('storeID') storeID: string,
    @Args('createReservationInput')
    createReservationInput: CreateReservationInput, //
    @Context() context: any,
  ) {
    const email = context.req.user.email;
    await this.reservationsService.checkUserPoint({
      email,
      createReservationInput,
    });
    return this.reservationsService.create({
      createReservationInput,
      email,
      storeID,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean, { description: '사용자가 예약취소하는 기능' })
  async cancelReservation(
    @Args('storeID') storeID: string, //
    @Args('date') date: string,
    @Context() context: any,
  ) {
    const email = context.req.user.email;
    await this.reservationsService.checkReservation({ storeID, email, date });
    return this.reservationsService.cancel({ email, storeID, date });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean, { description: '예약 확인으로 바꾸는 기능' })
  checkReservation(
    @Args({ name: 'resID' }) resID: string, //
  ) {
    return this.reservationsService.changeReservation({ resID });
  }
}
