import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardImg } from '../boardsImgs/entities/boardImg.entity';
import { User } from '../users/entities/user.entity';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BoardImg)
    private readonly boardImgRepository: Repository<BoardImg>,
  ) {}

  find({ page, order }) {
    return this.boardRepository.find({
      relations: ['user', 'user.pick', 'boardImg'],
      skip: (page - 1) * 6,
      take: 6,
      order: { createAt: order },
    });
  }

  async userFind({ email }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return this.boardRepository.find({
      where: { user: { userID: user.userID } },
      relations: ['boardImg', 'user'],
    });
  }

  findOne({ boardID }) {
    return this.boardRepository.findOne({
      where: { boardID },
      relations: ['boardImg', 'user'],
    });
  }

  async create({ email, createBoardInput }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    const { boardImg, ...boardData } = createBoardInput;
    const board: any = await this.boardRepository.save({
      ...boardData,
      user,
    });
    for (let i = 0; i < boardImg.length; i++) {
      const url = boardImg[i];
      await this.boardImgRepository.save({
        board,
        url,
      });
    }
    return board;
  }

  async update({ email, updateBoardInput, boardID }) {
    //유저 정보 가져오기
    const user = await this.userRepository.findOne({
      where: { email },
    });

    //기존 보드 데이터 가져오기
    const beforeBoard = await this.boardRepository.findOne({
      where: {
        user: { userID: user.userID },
        boardID: boardID,
      },
      relations: ['boardImg'],
    });

    //기존 이미지 지우기
    const boardImges = beforeBoard.boardImg;
    for (let i = 0; i < boardImges.length; i++) {
      const boardImgID = boardImges[i].boardImgID;
      this.boardImgRepository.delete({
        boardImgID,
      });
    }

    const board = await this.boardRepository.save({
      ...beforeBoard,
      ...updateBoardInput,
      user,
    });

    const newBoardImg = board.boardImg;
    for (let i = 0; i < newBoardImg.length; i++) {
      const url = newBoardImg[i];
      this.boardImgRepository.save({
        board,
        url,
      });
    }
    return board;
  }

  async delete({ boardID }) {
    const board = await this.boardRepository.findOne({
      where: { boardID },
    });
    if (!board) {
      throw new ConflictException('해당 내역이 없습니다.');
    }
    //이미지 지우기
    await this.boardImgRepository.delete({
      board: { boardID },
    });
    //게시글 지우기
    const result = await this.boardRepository.delete({
      boardID,
    });
    return result.affected ? true : false;
  }
}
