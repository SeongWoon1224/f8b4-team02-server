import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../stores/entities/store.entity';
import { User } from '../users/entities/user.entity';
import { Pick } from './entities/storePick.entity';
import { StoresPicksResolver } from './storesPicks.resolver';
import { StoresPicksService } from './storesPicks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pick, //
      Store,
      User,
    ]),
  ],
  providers: [
    StoresPicksResolver, //
    StoresPicksService,
  ],
})
export class StoresPicksModule {}
