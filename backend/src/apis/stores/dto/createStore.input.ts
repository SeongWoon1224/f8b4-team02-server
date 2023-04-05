import { Field, InputType, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { CreatePetInput } from 'src/apis/pets/dto/createPet.input';

//나중에 nullable 지우기
@InputType()
export class CreateStoreInput {
  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Min(0)
  @Field(() => Int, { nullable: true })
  entranceFee: number;

  @Field(() => String, { nullable: true })
  phone: string;

  @Field(() => String, { nullable: true })
  open: string;

  @Field(() => String, { nullable: true })
  close: string;

  @Field(() => String, { nullable: true })
  address: string;

  @Field(() => String, { nullable: true })
  addressDetail: string;

  @Field(() => Int, { nullable: true })
  bigDog: number;

  @Field(() => Int, { nullable: true })
  smallDog: number;

  @Field(() => [CreatePetInput], { nullable: true })
  pet?: CreatePetInput[];

  @Field(() => [String], { nullable: true })
  storeImg?: string[];

  @Field(() => [String], { nullable: true })
  storeTag?: string[];

  @Field(() => String, { nullable: true })
  locationTag?: string;
}
