import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { CreateReviewInput } from './dto/createReview.input';
import { UpdateReviewInput } from './dto/updateReview.input';
import { Review } from './entities/review.entity';
import { ReviewesService } from './reviewes.service';

@Resolver()
export class ReviewesResolver {
  constructor(
    private readonly reviewesService: ReviewesService, //
  ) {}

  @Query(() => Int)
  ReviewCount(
    @Args('storeID') storeID: string, //
  ) {
    return this.reviewesService.count({ storeID });
  }

  @Query(() => [Review])
  fetchStoreReviewes(
    @Args('storeID') storeID: string, //
    @Args({ name: 'order', defaultValue: 'DESC', nullable: true })
    order: string,
  ) {
    return this.reviewesService.findStoreReview({ storeID, order });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Review])
  fetchReview(
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.reviewesService.find({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Review)
  createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput, //
    @Args('storeID') storeID: string,
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.reviewesService.create({ createReviewInput, email, storeID });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Review)
  updateReview(
    @Args('updateReviewInput') updateReviewInput: UpdateReviewInput, //
    @Args('reviewID') reviewID: string,
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.reviewesService.update({ updateReviewInput, email, reviewID });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteReview(
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.reviewesService.delete({ email });
  }
}
