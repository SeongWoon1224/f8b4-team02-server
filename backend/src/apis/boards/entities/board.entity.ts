import { Field, ObjectType } from '@nestjs/graphql';
import { BoardImg } from 'src/apis/boardsImgs/entities/boardImg.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  boardID: string;

  @Column()
  @Field(() => String, { nullable: true })
  title: string;

  @Column()
  @Field(() => String, { nullable: true })
  contents: string;

  @CreateDateColumn()
  createAt: Date;

  @JoinColumn()
  @OneToMany(() => BoardImg, (boardImg) => boardImg.board)
  @Field(() => [BoardImg])
  boardImg: BoardImg[];

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;
}
