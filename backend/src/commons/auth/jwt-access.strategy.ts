import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';
import { Cache } from 'cache-manager';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'myAccessKey',
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const header = JSON.parse(JSON.stringify(req.headers));
    const accessToken = header.authorization.replace('Bearer ', '');
    const checkToken = await this.cacheManager.get(
      `accessToken:${accessToken}`,
    );
    if (checkToken) {
      throw new UnauthorizedException();
    }
    return {
      email: payload.email,
      userID: payload.sub,
    };
  }
}
