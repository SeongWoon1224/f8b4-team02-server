import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Review } from 'src/apis/reviewes/entities/review.entity';
import { ReviewResponse } from 'src/apis/reviewesResponses/entities/reviewResponse.entity';
import { Pick } from 'src/apis/storesPicks/entities/storePick.entity';
// import { Store } from 'src/apis/stores/entities/store.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  // OneToMany,
  // JoinTable,
} from 'typeorm';

//enum
export enum USER_ROLE_ENUM {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}
//enum type 등록
registerEnumType(USER_ROLE_ENUM, {
  name: 'USER_ROLE_ENUM',
});

export enum ACCESS_ENUM {
  ALLOWED = 'ALLOWED',
  PENDDING = 'PENDDING',
}
registerEnumType(ACCESS_ENUM, {
  name: 'ACCESS_ENUM',
});

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  userID: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Field(() => String)
  name?: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  @Field(() => String)
  nickname?: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @Field(() => String)
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({ type: 'char', length: 11, nullable: true })
  @Field(() => String)
  phone: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  @Field(() => Int)
  point: number;

  @Column({ nullable: true, default: '' })
  @Field(() => String)
  storeName?: string;

  @Column({ nullable: true, default: '' })
  @Field(() => String)
  businessLicenseImg?: string;

  @Column({ nullable: true, default: '' })
  @Field(() => String)
  profileImgUrl?: string;

  @Column({ type: 'enum', enum: USER_ROLE_ENUM })
  @Field(() => USER_ROLE_ENUM)
  role: string;

  @Column({ type: 'enum', enum: ACCESS_ENUM })
  @Field(() => ACCESS_ENUM)
  access: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @JoinColumn()
  @OneToMany(() => Pick, (pick) => pick.user)
  @Field(() => [Pick])
  pick: Pick;

  @JoinColumn()
  @OneToMany(() => Review, (review) => review.user)
  @Field(() => [Review])
  review: Review[];

  @OneToMany(() => ReviewResponse, (reviewRes) => reviewRes.user)
  @Field(() => [ReviewResponse])
  reviewRes: ReviewResponse[];
}
