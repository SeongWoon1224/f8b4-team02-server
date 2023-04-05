import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, //
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async setRefreshToken({ user, res, req }) {
    const refreshToken = this.jwtService.sign(
      { email: user.email, sub: user.userID },
      { secret: 'myRefreshKey', expiresIn: '2w' },
    );
    const originList = [
      'http://localhost:3000',
      'http://meongtopia.site',
      'https://meongtopia.site',
    ];
    const origin = req.headers.origin;
    if (originList.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods', //
      'GET, HEAD, OPTIONS, POST, PUT',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    );
    //배포
    // res.setHeader('Access-Control-Allow-Origin', 'https://myfrontsite.com');

    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; path=/; domain=.meongtopiaserver.shop; Secure; httpOnly; SameSite=None;`,
    );
  }

  getAccessToken({ user }) {
    return this.jwtService.sign(
      { email: user.email, sub: user.userID },
      { secret: 'myAccessKey', expiresIn: '5h' },
    );
  }

  async saveRedis({ accessToken, refreshToken }) {
    //accessToken을 저장, 1시간을 ttl으로 지정.
    await this.cacheManager.set(`accessToken:${accessToken}`, accessToken, {
      ttl: 60 * 60,
    });

    //refreshToken을 저장, 2주로 ttl을 지정.
    await this.cacheManager.set(`refreshToken:${refreshToken}`, refreshToken, {
      ttl: 60 * 60 * 24 * 7 * 2, // 2주
    });
  }

  async socialLogin({ req, res }) {
    //1. 가입했는지 확인하기
    let user = await this.usersService.findUserOne({ email: req.user.email });

    //2. 회원가입하기 //비밀번호는 아무내용으로 생성, 따라서 구글로 로그인해서 접속만 가능, 비밀번호 접속하려면 비밀번호를 수정해주세요를 안내.
    if (!user)
      user = await this.usersService.create({
        // hashedPassword: "000000",
        ...req.user,
        role: 'CLIENT',
        access: 'ALLOWED',
      });

    //3. 로그인하기(accessToken 만들어서 프론트 주기)
    this.setRefreshToken({ user, res, req });
    res.redirect(
      //redirect는 페이지를 전환하세요를 의미.
      // 'http://localhost:5500/frontend/login/index.html', //-> 백에서 테스트 할때,
      // 'http://localhost:3000',
      'https://meongtopia.site/home',
    );
  }
}
