import {
  UnauthorizedException,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UsersService } from '../users/users.service';
import { AuthService } from './auths.service';
import * as bcrypt from 'bcrypt';
import { IContext } from 'src/commons/type/context';
import { GqlAuthRefreshGuard } from 'src/commons/auth/gql-auth.guard';
import * as jwt from 'jsonwebtoken';
@Resolver()
export class AuthResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string, //
    @Args('password') password: string,
    @Context() context: IContext,
  ) {
    //1. 로그인(이메일이 일치하는 유저를 DB에서 찾기)
    const user = await this.usersService.findUserOne({ email });
    //2. 일치하는 유저가 없으면?(에러 던지기)
    if (!user) throw new UnprocessableEntityException('이메일이 없습니다.');

    //3. 일치하는 유저가 있지만 비밀번호가 틀리면?
    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) throw new UnprocessableEntityException('암호가 틀렸습니다.');

    //4.refreshToken(=JWT)를 만들어서 프론트 엔드 브라우저 쿠키에 저장해서 보내주기
    this.authService.setRefreshToken({
      user,
      res: context.res,
      req: context.req,
    }); // context 안에 있는 res
    //5. 일치하는 유저가 있고, 비밀번호도 맞았다면?
    // => accessToken(=JWT)을 만들어서 브라우저에 전달하기
    return this.authService.getAccessToken({ user });
  }

  @UseGuards(GqlAuthRefreshGuard)
  @Mutation(() => String)
  restoreAccessToken(
    @Context() context: IContext, //
  ) {
    return this.authService.getAccessToken({ user: context.req.user });
  }

  @Mutation(() => String)
  async logout(
    @Context() context: any, //
  ) {
    const header = JSON.parse(JSON.stringify(context.req.headers));
    console.log(header);
    const refreshToken = header.cookie.replace('refreshToken=', '');
    const accessToken = header.authorization.replace('Bearer ', '');

    try {
      jwt.verify(accessToken, 'myAccessKey');
      jwt.verify(refreshToken, 'myRefreshKey');
    } catch (error) {
      //검증시 오류 발생 = 검증 실패 따라서 에러메시지 발생하기
      throw new UnauthorizedException();
    }

    this.authService.saveRedis({ accessToken, refreshToken });
    return '로그아웃에 성공 하였습니다.';
  }
}
