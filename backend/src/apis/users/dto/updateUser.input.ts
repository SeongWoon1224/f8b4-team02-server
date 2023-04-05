import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  nickname?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => Int, { nullable: true })
  point?: number;

  @Field(() => String, { nullable: true })
  storeName?: string;

  @Field(() => String, { nullable: true })
  businessLicenseImg?: string;

  @Field(() => String, { nullable: true })
  profileImgUrl?: string;
}
