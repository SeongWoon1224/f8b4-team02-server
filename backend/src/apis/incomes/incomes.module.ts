import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { Income } from './entities/incomes.entity';
import { IncomesResolver } from './incomes.resolver';
import { IncomesService } from './incomes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Income, //
      User,
      Store,
    ]),
  ],
  providers: [
    IncomesResolver, //
    IncomesService,
  ],
})
export class IncomesModule {}
