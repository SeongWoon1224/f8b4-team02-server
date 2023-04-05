import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Store } from 'src/apis/stores/entities/store.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Income {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  incomeID: string;

  @Column()
  @Field(() => String)
  date: string;

  @Column({ default: 0 })
  @Field(() => Int)
  paymentNum: number;

  @Column({ default: 0 })
  @Field(() => Int)
  cancelNum: number;

  @Column({ default: 0 })
  @Field(() => Int)
  totalCash: number;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Store)
  @Field(() => Store)
  store: Store;
}
