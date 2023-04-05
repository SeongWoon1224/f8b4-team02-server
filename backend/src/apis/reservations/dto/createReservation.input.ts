import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateReservationInput {
  @Field(() => Int, { nullable: true })
  members: number;

  @Field(() => Int, { nullable: true })
  amount: number;

  @Field(() => Int, { nullable: true })
  pets: number;
}
