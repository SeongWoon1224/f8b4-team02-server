import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Store } from 'src/apis/stores/entities/store.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  petID: string;

  @Column({ nullable: true })
  @Field(() => String)
  petImgUrl: string;

  @Column({ nullable: true })
  @Field(() => String)
  name: string;

  @Column({ nullable: true })
  @Field(() => Int)
  age: number;

  @Column({ nullable: true })
  @Field(() => String)
  breed: string;

  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Store, (store) => store.pet)
  @Field(() => Store)
  store: Store;
}
