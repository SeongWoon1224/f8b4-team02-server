import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { Pick } from './entities/storePick.entity';

@Injectable()
export class StoresPicksService {
  constructor(
    @InjectRepository(Pick)
    private readonly pickRepository: Repository<Pick>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async fetchUserPicks({ userID }) {
    const allPicks = await this.pickRepository.find({
      where: { user: { userID: userID } },
      relations: ['store'],
    });

    const result = allPicks.map((pick) => {
      const storeID = pick.store.storeID;
      return this.storeRepository.findOne({
        where: { storeID },
        relations: ['locationTag', 'storeImg', 'pet', 'user', 'storeTag'],
      });
    });
    return result;
  }

  async toggle({ storeID, email }) {
    const store: any = await this.storeRepository.findOne({
      where: { storeID },
    });

    if (store === null) {
      throw new ConflictException('존재하지 않는 가게입니다.');
    }

    const myUser: any = await this.userRepository.findOne({ where: { email } });

    const pickTrue = await this.pickRepository.findOne({
      where: {
        user: { userID: myUser.userID },
        store: { storeID },
      },
    });

    if (pickTrue) {
      await this.pickRepository.delete({ pickID: pickTrue.pickID });
      await this.storeRepository.save({
        ...store,
        pickCount: store.pickCount - 1,
      });
      return false;
    } else {
      await this.pickRepository.save({
        store: { storeID },
        user: myUser,
      });
      await this.storeRepository.save({
        ...store,
        pickCount: store.pickCount + 1,
      });
      return true;
    }
  }
}
