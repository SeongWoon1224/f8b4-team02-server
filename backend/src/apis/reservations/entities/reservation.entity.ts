import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Income } from 'src/apis/incomes/entities/incomes.entity';
import { Store } from 'src/apis/stores/entities/store.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum RESERVATION_STATE {
  PENDING = 'PENDING',
  CANCEL = 'CANCEL',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(RESERVATION_STATE, {
  name: 'RESERVATION_STATE',
});

@Entity()
@ObjectType()
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  resID: string;

  @Column({ nullable: true })
  @Field(() => Int)
  members: number;

  @Column({ nullable: true, default: 0 })
  @Field(() => Int)
  pets: number;

  @Column({ nullable: true })
  @Field(() => Int)
  amount: number;

  @Column({ nullable: true })
  @Field(() => String)
  date: string;

  @Column({ type: 'enum', enum: RESERVATION_STATE, default: 'PENDING' })
  @Field(() => RESERVATION_STATE)
  state: string;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @JoinColumn()
  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @JoinColumn()
  @ManyToOne(() => Store, (store) => store.reservation)
  @Field(() => Store)
  store: Store;

  @JoinColumn()
  @ManyToOne(() => Income)
  @Field(() => Income)
  income: Income;
}
