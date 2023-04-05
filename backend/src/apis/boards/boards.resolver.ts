import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/commons/auth/gql-auth.guard';
import { BoardsService } from './boards.service';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Board } from './entities/board.entity';

@Resolver()
export class BoardsResolver {
  constructor(
    private readonly boardsService: BoardsService, //
  ) {}

  @Query(() => [Board])
  fetchBoards(
    @Args({ name: 'page', defaultValue: 1, nullable: true }) page: number, //
    @Args({
      name: 'order',
      defaultValue: 'DESC',
      nullable: true,
      description: '기본은 오름차순입니다. 내림차순은 DESC를 입력해주세요',
    })
    order: string,
  ) {
    //게시글 전체 불러 오기
    return this.boardsService.find({ page, order });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Board])
  fetchUserBoards(
    @Context() context: any, //
  ) {
    //유저가 쓴 게시글 목록 불러오기
    const email = context.req.user.email;
    return this.boardsService.userFind({ email });
  }
  @Query(() => Board)
  fetchBoard(
    @Args('boardID') boardID: string, //
  ) {
    //게시글내용 상세 불러오기
    return this.boardsService.findOne({ boardID });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  createBoard(
    @Context() context: any, //
    @Args('createBoardInput') createBoardInput: CreateBoardInput, //
  ) {
    //게시글 생성
    console.log(context);
    const email = context.req.user.email;
    return this.boardsService.create({ email, createBoardInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  updateBoard(
    @Context() context: any, //
    @Args('boardID') boardID: string,
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
  ) {
    //게시글 내용 수정
    const email = context.req.user.email;
    return this.boardsService.update({ email, updateBoardInput, boardID });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  deleteBoard(
    @Args('boardID') boardID: string, //
  ) {
    //게시글 삭제
    return this.boardsService.delete({ boardID });
  }
}
