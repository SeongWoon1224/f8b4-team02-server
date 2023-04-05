import { Field, InputType, Int } from '@nestjs/graphql';
import { Min } from 'class-validator';

//나중에 nullable 지우기
@InputType()
export class CreatePetInput {
  @Field(() => String, { nullable: true })
  petImgUrl: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Min(0)
  @Field(() => Int, { nullable: true })
  age: number;

  @Field(() => String, { nullable: true })
  breed: string;

  @Field(() => String, { nullable: true })
  description: string;
}
