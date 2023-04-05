import { UseGuards } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { Income } from './entities/incomes.entity';
import { IncomesService } from './incomes.service';

@Resolver()
export class IncomesResolver {
  constructor(
    private readonly incomesService: IncomesService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [[Income]])
  fetchIncomes(
    @Args({ name: 'order', defaultValue: 'ASC', nullable: true }) order: string,
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.incomesService.find({ email, order });
  }
  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Income])
  fetchStoreIncome(
    @Args({ name: 'order', defaultValue: 'ASC', nullable: true }) order: string,
    @Args('storeID') storeID: string,
  ) {
    return this.incomesService.findStore({ order, storeID });
  }
}
