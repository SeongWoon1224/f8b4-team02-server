import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FilesService } from './files.service';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@Resolver()
export class FilesResolver {
  constructor(
    private readonly filesService: FilesService, //
  ) {}

  @Mutation(() => [String])
  uploadFile(
    @Args({ name: 'files', type: () => [GraphQLUpload] }) files: FileUpload[], // graphql과 typescript 두개다 데이터 타입을 지정
  ) {
    //주소를 보내주기 때문에 Mutation의 return type이 string으로 지정.
    // console.log(files);
    return this.filesService.upload({ files });
  }

  @Mutation(() => String)
  uploadOneFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload, // graphql과 typescript 두개다 데이터 타입을 지정
  ) {
    //주소를 보내주기 때문에 Mutation의 return type이 string으로 지정.
    // console.log(files);
    return this.filesService.uploadOne({ file });
  }
}
