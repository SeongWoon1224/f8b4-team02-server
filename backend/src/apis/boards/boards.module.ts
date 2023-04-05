import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardImg } from '../boardsImgs/entities/boardImg.entity';
import { User } from '../users/entities/user.entity';
import { BoardsResolver } from './boards.resolver';
import { BoardsService } from './boards.service';
import { Board } from './entities/board.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Board, //
      User,
      BoardImg,
    ]),
  ],
  providers: [
    BoardsService, //
    BoardsResolver,
  ],
})
export class BoardsModule {}
