import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class StrLocationTag {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  locationTagID: string;

  @Column()
  @Field(() => String)
  name: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
