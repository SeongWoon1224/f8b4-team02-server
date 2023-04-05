import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { StoreTag } from './entities/storeTag.entity';
import { StoreTagsService } from './storesTags.service';

@Resolver()
export class StoreTagsResolver {
  constructor(
    private readonly storeTagsService: StoreTagsService, //
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [StoreTag])
  fetchTags(
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.storeTagsService.findAll({ email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => StoreTag)
  createTag(
    @Context() context: any,
    @Args('name') name: string, //
  ) {
    const email = context.req.user.email;
    return this.storeTagsService.create({ name, email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => StoreTag)
  updateTag(
    @Args('before') before: string, //
    @Args('after') after: string,
    @Context() context: any,
  ) {
    const email = context.req.user.email;
    return this.storeTagsService.update({ before, after, email });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteTag(
    @Args('name') name: string, //
    @Context() context: any,
  ) {
    const email = context.req.user.email;
    return this.storeTagsService.delete({ name, email });
  }
}
