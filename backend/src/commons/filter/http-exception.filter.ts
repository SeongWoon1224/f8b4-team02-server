import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException) //nest에게 에러를 여기서 잡아줘라고 데코레이터로 알려주기.
export class HttpExceptionFilter implements ExceptionFilter {
  //implements는 구현해라를 의미. 상속(extens)과는 의미가다르며
  //exception filter에는 인터페이스로 만들며 해당 파일안의 내용이 반드시 HttpEx~가 가져야함.
  //type 스크립트에서 데이터 타입을 명시해주는 것과 비슷.

  catch(exception: HttpException) {
    const message = exception.message;
    const status = exception.getStatus();

    console.log('========예외 발생==========');
    console.log('예외 메세지', message);
    console.log('예외 코드' + status);
    console.log('=========================');
  }
}
