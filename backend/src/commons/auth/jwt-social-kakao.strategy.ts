import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: process.env.KAKAO_CALL_BACK_URL,
      //scope: ['email', 'profile'],
    });
  }
  validate(accessToken, refreshToken, profile) {
    return {
      email: profile._json.kakao_account.email,
      name: profile.displayName,
      nickname: profile.displayName,
      hashedPassword: 'qewr!!1234@@',
      phone: '01000000000',
    };
  }
}
