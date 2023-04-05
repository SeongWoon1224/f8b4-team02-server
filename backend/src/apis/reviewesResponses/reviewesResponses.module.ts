import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../reviewes/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { ReviewResponse } from './entities/reviewResponse.entity';
import { ReviewesResponsesResolver } from './reviewesResponses.resolver';
import { ReviewesResponsesService } from './reviewesResponses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReviewResponse, //
      User,
      Review,
    ]),
  ],
  providers: [
    ReviewesResponsesResolver, //
    ReviewesResponsesService,
  ],
})
export class ReviewesResponsesModule {}
