import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

//enum
export enum USER_ROLE_ENUM {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  userID: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  @Field(() => String)
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Field(() => String)
  nickname: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @Field(() => String)
  email: string;

  @Column({ nullable: false })
  // @Field(() => String)
  password: string;

  @Column({ type: 'char', length: 11, nullable: false })
  @Field(() => String)
  phone: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  @Field(() => Int)
  point: number;

  @Column()
  @Field(() => String)
  businessLicenseImg: string;

  @Column({ type: 'enum', enum: USER_ROLE_ENUM })
  @Field(() => USER_ROLE_ENUM)
  role: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
