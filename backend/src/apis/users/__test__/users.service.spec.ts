import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from 'src/apis/reviewes/entities/review.entity';
import { ReviewesService } from 'src/apis/reviewes/reviewes.service';
import { Pick } from 'src/apis/storesPicks/entities/storePick.entity';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';

class MockUsersRepository {
  mydb = [
    {
      name: '성운',
      nickname: '소녀',
      email: 'a@a.com',
      password: '1234',
      phone: '01011111111',
    },
    {
      name: '성운1',
      nickname: '소녀1',
      email: 'a@a1.com',
      hashedPassword: '1234',
      phone: '01011111111',
    },
  ];

  //   findOne({ where }) {
  //     const users = this.mydb.filter((el) => el.email === where.email);
  //     if (users.length) return users[0];
  //     return null;
  //   }

  save({ name, nickname, email, password, phone }) {
    this.mydb.push({ name, nickname, email, password, phone });
    return { name, nickname, email, password, phone };
  }
}

class MockPicksRepository {}
class MockReviewesRepository {}

describe('UsersService', () => {
  let usersService: UsersService;
  beforeEach(async () => {
    const usersModule = await Test.createTestingModule({
      //   imports: [TypeORM.....],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: MockUsersRepository,
        },
        {
          provide: getRepositoryToken(Pick),
          useClass: MockPicksRepository,
        },
        {
          provide: getRepositoryToken(Review),
          useClass: MockReviewesRepository,
        },
        ReviewesService,
      ],
    }).compile();

    usersService = usersModule.get<UsersService>(UsersService); //new UsersService(UsersRepository)
  });
  //   describe('findOne', () => {});

  describe('create', () => {
    it('이미 존재하는 이메일 검증하기', async () => {
      const myData = {
        name: '성운',
        nickname: '소녀',
        email: 'a@a.com',
        hashedPassword: '1234',
        phone: '01011111111',
      };

      const role = 'CLIENT';
      const access = 'ALLOWED';
      try {
        await usersService.create({ role, access, ...myData });
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });
    it('회원 등록 잘됐는지 검증!!', async () => {
      const myData = {
        name: '성운1',
        nickname: '소녀1',
        email: 'a@a1.com',
        hashedPassword: '1234',
        phone: '01011111111',
      };

      const role = 'CLIENT';
      const access = 'ALLOWED';

      const result = await usersService.create({ role, access, ...myData });
      expect(result).toStrictEqual(myData);
    });
  });
});
