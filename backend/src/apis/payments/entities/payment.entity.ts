import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PAYMENT_ENUM {
  PAYMENT = 'PAYMENT',
  CANCEL = 'CANCEL',
}

registerEnumType(PAYMENT_ENUM, {
  name: 'PAYMENT_ENUM',
});

@ObjectType()
@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String, { nullable: true })
  paymentID: string;

  @Column()
  @Field(() => String, { nullable: true })
  impUid: string;

  @Column()
  @Field(() => Int, { nullable: true })
  amount: number;

  @Column({ type: 'enum', enum: PAYMENT_ENUM })
  @Field(() => PAYMENT_ENUM, { nullable: true })
  status: PAYMENT_ENUM;

  @CreateDateColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;
}
