import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../boards/entities/board.entity';
import { BoardImg } from '../boardsImgs/entities/boardImg.entity';
import { Income } from '../incomes/entities/incomes.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReservationsService } from '../reservations/reservations.service';
import { Review } from '../reviewes/entities/review.entity';
import { ReviewResponse } from '../reviewesResponses/entities/reviewResponse.entity';
import { Store } from '../stores/entities/store.entity';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review, //
      ReviewResponse,
      Board,
      BoardImg,
      User,
      Store,
      Income,
      Reservation,
    ]),
  ],
  providers: [
    UsersResolver, //
    UsersService,
    ReservationsService,
  ],
})
export class UsersModule {}
