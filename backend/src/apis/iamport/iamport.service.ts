import {
  HttpException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IamportService {
  async getToken() {
    try {
      //인증 토큰 받기
      const token = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: process.env.IAMPORT_CLIENT_ID, // REST API키
          imp_secret: process.env.IAMPORT_CLIENT_SECRET, // REST API Secret
        },
      });
      const { access_token } = token.data.response;
      return access_token;
    } catch (error) {
      throw new HttpException(
        error.response.data.message,
        error.response.status,
      );
    }
  }

  //impUid로 서버에서 결제정보 조회하기
  async getPaymentData({ impUid, getToken }) {
    try {
      const access_token = getToken;
      const getPaymentData = await axios({
        url: `https://api.iamport.kr/payments/${impUid}`, // imp_uid 전달
        method: 'get', // GET method
        headers: { Authorization: `Bearer ${access_token}` }, // 인증 토큰 Authorization header에 추가 해보고 안되면 berar지우기
      });
      const paymentData = getPaymentData.data.response; // 조회한 결제 정보

      return paymentData;
    } catch (error) {
      throw new HttpException(
        error.response.data.message,
        error.response.status,
      );
      // throw new UnprocessableEntityException("impUid 값오류입니다.");
    }
  }

  async getCancelData({ access_token, payment, reason }) {
    try {
      const { impUid, amount } = payment;
      const getCancelData = await axios({
        url: 'https://api.iamport.kr/payments/cancel',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
        },
        data: {
          reason, // 가맹점 클라이언트로부터 받은 환불사유
          imp_uid: impUid, // imp_uid를 환불 `unique key`로 입력
          amount, // 가맹점 클라이언트로부터 받은 환불금액
          //   checksum: amount, // [권장] 환불 가능 금액 입력
        },
      });
      const { response } = getCancelData.data;
      return response;
    } catch (error) {
      throw new UnprocessableEntityException('입력 값 오류입니다.');
    }
  }
}
