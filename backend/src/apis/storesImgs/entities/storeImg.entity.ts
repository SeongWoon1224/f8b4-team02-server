import { Field, ObjectType } from '@nestjs/graphql';
import { Store } from 'src/apis/stores/entities/store.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class StoreImg {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  storeImgID: string;

  @Column()
  @Field(() => String)
  url: string;

  @ManyToOne(() => Store, (store) => store.storeImg)
  @Field(() => Store)
  store: Store;
}
