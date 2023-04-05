import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Income } from '../incomes/entities/incomes.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { Review } from '../reviewes/entities/review.entity';
import { ReviewResponse } from '../reviewesResponses/entities/reviewResponse.entity';
import { StoreImg } from '../storesImgs/entities/storeImg.entity';
import { Pick } from '../storesPicks/entities/storePick.entity';
import { StoreTag } from '../storesTags/entities/storeTag.entity';
import { StrLocationTag } from '../strLocationsTags/entities/strLocationTag.entity';
import { User } from '../users/entities/user.entity';
import { Store } from './entities/store.entity';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(StoreTag)
    private readonly storeTagsRepository: Repository<StoreTag>,
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(StoreImg)
    private readonly storeImageRepository: Repository<StoreImg>,
    @InjectRepository(StrLocationTag)
    private readonly StrLocationTagRepository: Repository<StrLocationTag>,
    @InjectRepository(Pick)
    private readonly pickRepository: Repository<Pick>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ReviewResponse)
    private readonly reviewResponseRepository: Repository<ReviewResponse>,

    private readonly dataSource: DataSource,
  ) {}

  async find({ page, order }) {
    const result = await this.storesRepository.find({
      relations: ['locationTag', 'user', 'storeTag', 'storeImg', 'pet'],
      skip: (page - 1) * 10,
      take: 10,
      order: { createdAt: order },
    });
    return result;
  }

  async findOwnerStores({ email }) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });
    const result = await this.storesRepository.find({
      where: {
        user: { userID: user.userID },
      },
      relations: [
        'locationTag',
        'user',
        'storeTag',
        'storeImg',
        'pet',
        'reservation',
        'reservation.user',
      ],
    });
    return result;
  }

  async findOne({ storeID }) {
    const result = await this.storesRepository.findOne({
      where: { storeID },
      relations: [
        'locationTag',
        'user',
        'storeTag',
        'storeImg',
        'pet',
        'reservation',
        'reservation.user',
      ],
    });
    return result;
  }

  async findTag({ name }) {
    const storeTag = await this.storeTagsRepository.findOne({
      where: { name },
    });
    const stores = await this.storesRepository.find({
      where: { storeTag },
    });
    return stores;
  }

  async findLocation({ name }) {
    const locationTag: any = await this.storeTagsRepository.findOne({
      where: { name },
    });
    const stores = await this.storesRepository.find({
      where: { locationTag },
    });
    return stores;
  }

  async findPickRank({ order }) {
    const stores = await this.storesRepository.find({
      relations: ['locationTag', 'user', 'storeTag', 'storeImg', 'pet'],
      take: 3,
      order: { pickCount: order },
    });
    return stores;
  }
  async create({ email, createStoreInput }) {
    try {
      // 유저 정보 꺼내오기
      const user = await this.usersRepository.findOne({ where: { email } });
      this.checkAccess({ user });

      const { pet, storeImg, storeTag, locationTag, ...store } =
        createStoreInput;

      //태그 저장
      const tag = [];
      for (let i = 0; i < storeTag.length; i++) {
        const tagIs = await this.storeTagsRepository.findOne({
          where: { name: storeTag[i] },
        });
        tag.push(tagIs);
      }
      // 지역태그 저장
      const locationTagData = await this.StrLocationTagRepository.findOne({
        where: { name: locationTag },
      });
      if (!locationTagData) {
        throw new ConflictException('해당 지역 태그가 없습니다.');
      }

      const storeData = await this.storesRepository.save({
        user,
        locationTag: locationTagData,
        storeTag: tag,
        ...store,
      });

      //펫 이미지 테이블에 저장
      for (let i = 0; i < pet.length; i++) {
        await this.petRepository.save({
          ...pet[i],
          store: storeData,
          storeTag,
        });
      }

      //이미지는 store 저장하고 저장
      for (let i = 0; i < storeImg.length; i++) {
        const url = storeImg[i];
        await this.storeImageRepository.save({
          url,
          store: storeData,
        });
      }

      return storeData;
    } catch (error) {
      throw new error('가게 생성에 실패하였습니다.');
    }
  }

  async update({ email, updateStoreInput, storeID }) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });
    const { pet, storeImg, storeTag, locationTag, ...storeInput } =
      updateStoreInput;

    //가게의 기존 정보 가져오기
    let storeData = await this.storesRepository.findOne({
      where: {
        user: { userID: user.userID },
        storeID,
      },
    });
    // let storeData;

    //1. 태그 저장하기
    if (storeTag) {
      //1-1 태그 정보 삭제하기 (중간테이블에서 연결되어 있던걸 끊어주기)
      await this.dataSource.manager
        .createQueryBuilder()
        .delete()
        .from('store_store_tag_store_tag')
        .where('storeStoreID = :storeStoreID', { storeStoreID: storeID })
        .execute();
      //1-2 태그 정보 생성하기
      const tag = [];
      for (let i = 0; i < storeTag.length; i++) {
        const tagIs = await this.storeTagsRepository.findOne({
          where: { name: storeTag[i] },
        });
        tag.push(tagIs);
      }
      storeData = await this.storesRepository.save({
        ...storeData,
        user,
        storeTag: tag,
      });
    }

    //2. 지역 태그 저장하기
    if (locationTag) {
      //2-1. 지역 태그 정보 가져오기
      const locationTagData: any = await this.StrLocationTagRepository.findOne({
        where: { name: locationTag },
      });
      if (!locationTagData) {
        throw new ConflictException('해당 지역 태그가 없습니다.');
      }
      storeData = await this.storesRepository.save({
        ...storeData,
        user,
        locationTag: locationTagData,
      });
    }

    //3. 가게 정보 저장하기
    storeData = await this.storesRepository.save({
      ...storeData,
      ...storeInput,
    });

    //4. 펫 저장하기
    if (pet) {
      //4-1기존 펫 정보 삭제하기
      this.petRepository.delete({
        store: { storeID },
      });
      //4-2새로운 팻 정보 저장하기
      for (let i = 0; i < pet.length; i++) {
        await this.petRepository.save({
          ...pet[i],
          store: storeData,
        });
      }
    }

    //5. 가게 이미지 저장하기
    if (storeImg) {
      //5-1. 기존 이미지 삭제
      this.storeImageRepository.delete({
        store: { storeID },
      });
      //5-1. 새로운 이미지 등록
      for (let i = 0; i < storeImg.length; i++) {
        const url = storeImg[i];
        await this.storeImageRepository.save({
          url,
          store: storeData,
        });
      }
    }
  }

  async delete({ storeID }) {
    // soft delete 진행
    const result = await this.storesRepository.softDelete(
      storeID, //
    );
    this.pickRepository.delete({
      store: { storeID },
    });
    this.petRepository.delete({
      store: { storeID },
    });
    this.storeImageRepository.delete({
      store: { storeID },
    });
    this.incomeRepository.delete({
      store: { storeID },
    });
    //리뷰랑 리뷰답글 지우기
    const reviews = await this.reviewRepository.find({
      where: { store: { storeID } },
      relations: ['store', 'user', 'reviewRes'],
    });

    for (let i = 0; i < reviews.length; i++) {
      this.reviewResponseRepository.delete({
        reviewResID: reviews[i].reviewRes.reviewResID,
      });
    }

    this.reviewRepository.delete({
      store: { storeID },
    });

    const reservation = await this.reservationRepository.find({
      where: { store: { storeID } },
    });
    //예약 삭제전에 상태를 취소로 바꾸기
    for (let i = 0; i < reservation.length; i++) {
      this.reservationRepository.save({
        ...reservation[i],
        state: 'CANCEL',
      });
    }
    //예약 내역삭제
    this.reservationRepository.delete({
      store: { storeID },
    });

    // 중간테이블에서 스토어 정보 삭제
    await this.dataSource.manager
      .createQueryBuilder()
      .delete()
      .from('store_store_tag_store_tag')
      .where('storeStoreID = :storeStoreID', { storeStoreID: storeID })
      .execute();

    return result.affected ? true : false;
  }

  checkAccess({ user }) {
    if (user.role !== 'OWNER') {
      throw new ConflictException('해당 권한이 존재하지 않습니다.');
    }
    if ((user.access = 'PENDDING')) {
      throw new ConflictException('아직 승인되지 않은 사용장입니다.');
    }
  }
}
