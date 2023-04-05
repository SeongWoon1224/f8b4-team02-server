import { InputType, PartialType } from '@nestjs/graphql';
import { CreatePetInput } from './createPet.input';

@InputType()
export class updatePetInput extends PartialType(CreatePetInput) {}
