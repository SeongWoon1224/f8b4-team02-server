import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from '../incomes/entities/incomes.entity';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { Reservation } from './entities/reservation.entity';
import { ReservationsResolver } from './reservations.resolver';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation, //
      User,
      Store,
      Income,
    ]),
  ],
  providers: [
    ReservationsResolver, //
    ReservationsService,
  ],
})
export class ReservationsModule {}
