import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';
import { Cache } from 'cache-manager';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: 'myRefreshKey',
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    // const header = JSON.parse(JSON.stringify(req.headers));
    const refreshToken = req.headers.cookie.replace('refreshToken=', '');
    const checkToken = await this.cacheManager.get(
      `refreshToken:${refreshToken}`,
    );
    if (checkToken) {
      throw new UnauthorizedException();
    }
    return {
      email: payload.email,
      id: payload.sub,
    };
  }
}
