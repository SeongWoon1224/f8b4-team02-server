import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';

export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALL_BACK_URL,
      scope: ['email', 'profile'],
    });
  }
  validate(accessToken, refreshToken, profile) {
    const email = profile._json.email;
    const id = email.split('@')[0];
    return {
      email: profile._json.email,
      name: id,
      nickname: id,
      hashedPassword: 'qewr!!1234@@',
      phone: '01000000000',
    };
  }
}
