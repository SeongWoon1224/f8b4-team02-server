import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReviewResponse } from '../reviewesResponses/entities/reviewResponse.entity';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { Review } from './entities/review.entity';
import { ReviewesResolver } from './reviewes.resolver';
import { ReviewesService } from './reviewes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      Store,
      Reservation,
      ReviewResponse,
      User, //
    ]),
  ],
  providers: [
    ReviewesResolver, //
    ReviewesService,
  ],
})
export class ReviewesModule {}
