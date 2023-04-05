import { Field, ObjectType } from '@nestjs/graphql';
import { Review } from 'src/apis/reviewes/entities/review.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class ReviewResponse {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  reviewResID: string;

  @Column()
  @Field(() => String)
  contents: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @OneToOne(() => Review)
  @Field(() => Review)
  review: Review;
}
