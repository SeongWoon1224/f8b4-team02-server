import { Field, Float, ObjectType } from '@nestjs/graphql';
import { ReviewResponse } from 'src/apis/reviewesResponses/entities/reviewResponse.entity';
import { Store } from 'src/apis/stores/entities/store.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  reviewID: string;

  @Column()
  @Field(() => String)
  contents: string;

  @Column()
  @Field(() => Float)
  rating: number;

  @CreateDateColumn()
  @Field(() => Date)
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Store)
  @Field(() => Store)
  store: Store;

  @ManyToOne(() => User, (user) => user.review)
  @Field(() => User)
  user: User;

  @JoinColumn()
  @OneToOne(() => ReviewResponse, { nullable: true })
  @Field(() => ReviewResponse)
  reviewRes?: ReviewResponse;
}
