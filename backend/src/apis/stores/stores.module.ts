import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { StoresResolver } from './stores.resolver';
import { StoresService } from './stores.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Store, //
      User,
      Reservation,
      ReviewResponse,
      StoreTag,
      Pet,
      StoreImg,
      StrLocationTag,
      Review,
      Pick,
      Income,
    ]),
    ElasticsearchModule.register({
      node: 'http://elasticsearch:9200',
    }),
  ],
  providers: [
    StoresService, //
    StoresResolver,
  ],
})
export class StoresModule {}
