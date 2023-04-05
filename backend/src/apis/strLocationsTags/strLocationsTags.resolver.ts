import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { StrLocationTag } from './entities/strLocationTag.entity';
import { StrLocationsTagsService } from './strLocationsTags.service';

@Resolver()
export class StrLocationsTagsResolver {
  constructor(
    private readonly strLocationsTagsService: StrLocationsTagsService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [StrLocationTag])
  fetchLocationTags(
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.strLocationsTagsService.findAll({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => StrLocationTag)
  createLocationTag(
    @Args('name') name: string, //
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.strLocationsTagsService.create({ name, email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => StrLocationTag)
  updateLocationTag(
    @Args('before') before: string, //
    @Args('after') after: string,
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.strLocationsTagsService.update({ before, after, email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteLocationTag(
    @Args('name') name: string, //
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.strLocationsTagsService.delete({ name, email });
  }
}
