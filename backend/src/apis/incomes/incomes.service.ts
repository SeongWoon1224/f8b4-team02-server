import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { Income } from './entities/incomes.entity';

@Injectable()
export class IncomesService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async find({ email, order }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    const stores = await this.storeRepository.find({
      where: { user: { userID: user.userID } },
    });
    const result = await Promise.all(
      stores.map(async (store) => {
        const storeID = store.storeID;
        const aaa = await this.incomeRepository.find({
          where: { store: { storeID } },
          relations: [
            'store',
            'store.storeImg',
            'store.pet',
            'store.storeTag',
            'store.locationTag',
          ],
          order: { date: order },
        });
        return aaa;
      }),
    );
    return result;
  }

  async findStore({ order, storeID }) {
    const incomes = await this.incomeRepository.find({
      where: {
        store: { storeID },
      },
      relations: [
        'store',
        'store.storeImg',
        'store.pet',
        'store.storeTag',
        'store.locationTag',
      ],
      order: { date: order },
    });
    return incomes;
  }
}
