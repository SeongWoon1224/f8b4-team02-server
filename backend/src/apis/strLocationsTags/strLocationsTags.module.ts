import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { StrLocationTag } from './entities/strLocationTag.entity';
import { StrLocationsTagsResolver } from './strLocationsTags.resolver';
import { StrLocationsTagsService } from './strLocationsTags.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StrLocationTag, //
      User,
    ]),
  ],
  providers: [
    StrLocationsTagsResolver, //
    StrLocationsTagsService,
  ],
})
export class StrLocationsTagsModule {}
