import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { ReviewResponse } from './entities/reviewResponse.entity';
import { ReviewesResponsesService } from './reviewesResponses.service';

@Resolver()
export class ReviewesResponsesResolver {
  constructor(
    private readonly reviewesResponsesService: ReviewesResponsesService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [ReviewResponse])
  fetchReview(
    @Context() context: any, //
  ) {
    //사장님이 리뷰에 댓글 달아주니까 사장님 페이지에서 만약, 내가 쓴 리뷰보기가 있다면 쓸 api
    const email = context.req.user.email;
    return this.reviewesResponsesService.find({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => ReviewResponse)
  createResponse(
    @Args('reviewID') reviewID: string,
    @Args('contents') contents: string, //
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.reviewesResponsesService.create({ reviewID, email, contents });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => ReviewResponse)
  updateResponse(
    @Context() context: any, //
    @Args('contents') contents: string, //
  ) {
    const email = context.req.user.email;
    return this.reviewesResponsesService.update({ contents, email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteResponse(
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.reviewesResponsesService.delete({ email });
  }
}
