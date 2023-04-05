import {
  CACHE_MANAGER,
  Inject,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/updateUser.input';
import { CreateUserInput } from './dto/createUser.input';

import { Cache } from 'cache-manager';
import { ReservationsService } from '../reservations/reservations.service';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService, //
    private readonly reservationsService: ReservationsService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [User])
  fetchUsers(
    @Context() context: any, //
    @Args('name') name: string, //
  ) {
    const email = context.req.user.email;
    return this.usersService.findAll({ email, name });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  fetchUser(
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return this.usersService.findUserOne({ email });
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10.2);
    const role = 'CLIENT';
    const access = 'ALLOWED';
    return this.usersService.create({
      ...createUserInput,
      hashedPassword,
      role,
      access,
    });
  }

  @Mutation(() => User)
  async createOwner(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10.2);
    const role = 'OWNER';
    const access = 'PENDDING';
    return this.usersService.create({
      ...createUserInput,
      hashedPassword,
      role,
      access,
    });
  }

  @Mutation(() => User)
  async createAdim(
    @Args('createUserInput') createUserInput: CreateUserInput, //
  ) {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10.2);
    const role = 'ADMIN';
    const access = 'ALLOWED';
    return this.usersService.create({
      hashedPassword,
      role,
      access,
      ...createUserInput,
    });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUser(
    @Args('email') email: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ) {
    //수정하기
    return this.usersService.update({ email, updateUserInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async deleteProfile(
    @Context() context: any, //
  ) {
    const email = context.req.user.email;
    return await this.usersService.deleteprofile({ email });
  }

  @Mutation(() => String)
  async updateUserPwd(
    @Args('email') email: string,
    @Args('phone') phone: string,
    @Args('updateUserPwdInput') updateUserPwdInput: string,
  ) {
    const myToken = await this.cacheManager.get(phone);
    if (!myToken) {
      throw new UnprocessableEntityException('인증을 하세요');
    }

    const hashedPassword = await bcrypt.hash(updateUserPwdInput, 10.2);
    return await this.usersService.updatePwd({ email, hashedPassword });
  }

  @Mutation(() => Boolean)
  deleteUser(
    @Args('email') email: string, //
  ) {
    return this.usersService.delete({ email });
  }

  @Mutation(() => String)
  async getToken(@Args('phone') phone: string) {
    return await this.usersService.sendTokenSMS({ phone });
  }

  @Mutation(() => String)
  async getTokenEmail(@Args('email') email: string) {
    return await this.usersService.sendTokenEmail({ email });
  }

  @Mutation(() => String)
  async checkValidToken(
    @Args('phone') phone: string,
    @Args('token') token: string,
  ) {
    return await this.usersService.matchToken({ phone, token });
  }

  @Mutation(() => Boolean)
  checkNickname(
    @Args('nickname') nickname: string, //
  ) {
    return this.usersService.checkNickname({ nickname });
  }
}
