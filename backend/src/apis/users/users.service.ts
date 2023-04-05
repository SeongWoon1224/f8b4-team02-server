import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Storage } from '@google-cloud/storage';
import { getToday } from 'src/commons/utils/utils';
import coolsms from 'coolsms-node-sdk';
import { Cache } from 'cache-manager';

import { MailerService } from '@nestjs-modules/mailer';
import { Review } from '../reviewes/entities/review.entity';
import { ReviewResponse } from '../reviewesResponses/entities/reviewResponse.entity';
import { Board } from '../boards/entities/board.entity';
import { BoardImg } from '../boardsImgs/entities/boardImg.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewResponse)
    private readonly reviewResponseRepository: Repository<ReviewResponse>,
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(BoardImg)
    private readonly boardImgRepository: Repository<BoardImg>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailerService: MailerService,
  ) {}

  async findAll({ email, name }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user.role !== 'ADMIN') {
      throw new ConflictException('관리자 권한이 아닙니다.');
    }
    return this.userRepository.find({
      where: { name: Like(`%${name}%`) },
    });
  }

  findUserOne({ email }) {
    return this.userRepository.findOne({
      where: { email },
      relations: [
        'pick',
        'pick.store',
        'pick.store.storeImg',
        'pick.store.storeTag',
        'review',
        'review.store',
        'review.reviewRes',
      ],
    });
  }

  async create({ hashedPassword: password, role, access, ...createUserInput }) {
    const { name, email, phone, ...rest } = createUserInput;
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user) {
      throw new ConflictException('이미 등록된 이메일입니다');
    }
    await this.sendEmail({ email, name });

    const userData = await this.userRepository.save({
      ...createUserInput,
      password,
      role,
      access,
    });

    return userData;
  }

  async update({ email, updateUserInput }) {
    const myuser = await this.userRepository.findOne({
      where: { email: email },
    });

    const result = this.userRepository.save({
      ...myuser,
      email: email,
      ...updateUserInput,
    });
    return result;
  }

  async updatePwd({ email, hashedPassword: newhashedPassword }) {
    try {
      const myuser = await this.userRepository.findOne({
        where: { email: email },
      });
      await this.userRepository.save({
        ...myuser,
        password: newhashedPassword,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteprofile({ email }) {
    const bucket = process.env.bucket;
    const user = await this.userRepository.findOne({ where: { email: email } });
    const prevImg = user.profileImgUrl.split(`${bucket}/${getToday()}`);
    const prevImgName = prevImg[prevImg.length - 1];

    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_PROJECT_KEY_FILENAME,
    });
    const result = await storage.bucket(bucket).file(prevImgName).delete();

    const { profileImgUrl, ...userrest } = user;
    const deleteProfileUrl = { ...userrest, profileImgUrl: null };
    await this.userRepository.save(deleteProfileUrl);

    if (result) {
      return true;
    }
  }
  async delete({ email }) {
    //유저 정보 찾기
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new ConflictException('해당 유저가 존재하지 않습니다.');
    }
    //리뷰 지우기
    this.reviewRepository.delete({
      user: { userID: user.userID },
    });
    //리뷰 댓글 지우기
    this.reviewResponseRepository.delete({
      user: { userID: user.userID },
    });
    const boards = await this.boardRepository.find({
      where: {
        user: { userID: user.userID },
      },
    });
    //게시글 이미지 지우기
    for (let i = 0; i < boards.length; i++) {
      const board = boards[i];
      this.boardImgRepository.delete({
        boardImgID: board.boardID,
      });
    }
    this.boardRepository.delete({
      user: { userID: user.userID },
    });
    //유저에 연결된 정보 삭제
    const result1 = await this.userRepository.softDelete({ email: email });

    return result1.affected ? true : false;
  }

  async sendTokenSMS({ phone }) {
    const isValid = this.checkValidationPhone({ phone });
    if (isValid) {
      // try {
      const digit = await this.userRepository.findOne({
        where: { phone: phone },
      });
      if (digit) {
        throw new ConflictException('이미 등록된 번호입니다.');
      }
      const count = 6;
      const token = String(Math.floor(Math.random() * 10 ** count)).padStart(
        count,
        '0',
      );

      const SMS_KEY = process.env.SMS_KEY;
      const SMS_SECRET = process.env.SMS_SECRET;
      const SMS_SENDER = process.env.SMS_SENDER;

      const messageService = new coolsms(SMS_KEY, SMS_SECRET);
      await messageService.sendOne({
        to: phone,
        from: SMS_SENDER,
        text: `안녕하세요! [ 멍토피아 ] 가입 인증번호는 [${token}] 입니다.`,
        type: 'SMS',
        autoTypeDetect: false,
      });
      const myToken = await this.cacheManager.get(phone);
      if (myToken) {
        await this.cacheManager.del(phone);
      }
      await this.cacheManager.set(phone, token, {
        ttl: 180,
      });
      return token;
      // } catch (error) {
      //   throw new error();
      // }
    }
  }

  async sendTokenEmail({ email }) {
    const EMAIL_USER = process.env.EMAIL_USER;
    const count = 6;
    const token = String(Math.floor(Math.random() * 10 ** count)).padStart(
      count,
      '0',
    );
    await this.mailerService
      .sendMail({
        to: email,
        from: EMAIL_USER,
        subject: '인증 번호입니다.',
        html: '6자리 인증 코드 : ' + `<b> ${token}</b>`, // The `.pug` or `.hbs` extension is appended automatically.
      })
      .catch((err) => {
        throw new err();
      });
    return token;
  }

  async sendEmail({ email, name }) {
    const EMAIL_USER = process.env.EMAIL_USER;

    const mytemplate = `
    <html>
        <body>
            <div style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 500px;">
                <img class="LogoImg" src="https://cdn.discordapp.com/attachments/1012196150989828097/1019146948638425098/Group_57.png" />
                <h1>${name}님 가입을 환영합니다!</h1>
                <hr />
                <div style="color: black;">이름: ${name}</div>
                <div>email: ${email}</div>
                <div>가입일: ${getToday()}</div>
            </div>
            </div>
        </body>
    </html>
    `;

    await this.mailerService
      .sendMail({
        to: email,
        from: EMAIL_USER,
        subject: '멍토피아 가입을 환영합니다.',
        html: mytemplate,
        // html: `<b> ${name}님 가입을 환영합니다.</b>`, // The `.pug` or `.hbs` extension is appended automatically.
      })
      .catch((err) => {
        throw new err();
      });
    return true;
  }

  checkValidationPhone({ phone }) {
    if (phone.length !== 10 && phone.length !== 11) {
      return false;
    } else {
      return true;
    }
  }

  async checkNickname({ nickname }) {
    const user = await this.userRepository.find({
      where: { nickname },
    });
    return user.length !== 0 ? true : false;
  }

  async matchToken({ phone, token }) {
    const myToken = await this.cacheManager.get(phone);

    if (myToken === token) {
      return true;
    }
    throw new UnprocessableEntityException('토큰이 잘못되었습니다');
  }
}
