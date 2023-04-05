import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field(() => Float)
  rating: number;

  @Field(() => String)
  contents: string;
}
