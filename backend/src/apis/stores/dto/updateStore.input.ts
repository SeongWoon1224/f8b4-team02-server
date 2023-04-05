import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { updatePetInput } from 'src/apis/pets/dto/updatePet.input';
import { CreateStoreInput } from './createStore.input';

//PartialType(CreateStoreInput)
@InputType()
export class UpdateStoreInput extends PartialType(
  OmitType(CreateStoreInput, ['pet']),
) {
  @Field(() => [updatePetInput], { nullable: true })
  pet: updatePetInput[];
}
