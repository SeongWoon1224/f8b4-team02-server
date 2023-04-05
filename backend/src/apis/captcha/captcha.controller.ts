import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as request from 'request';
import * as fs from 'fs';

@Controller()
export class CaptchaController {
  client_id = process.env.NAVER_CLIENT_ID;
  client_secret = process.env.NAVER_CLIENT_SECRET;

  /**
   * Get Captcha Key REST API
   * @type [`GET`]
   * @endPoint `/captcha/nKey`
   */
  @Get('/captcha/nKey')
  async getCaptchaKey(
    @Req() req: Request, //
    @Res() res: Response,
  ) {
    const code = '0';
    const api_url = 'https://openapi.naver.com/v1/captcha/nkey?code=' + code;

    const options = {
      url: api_url,
      headers: {
        'X-Naver-Client-Id': this.client_id,
        'X-Naver-Client-Secret': this.client_secret,
      },
    };

    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const key = JSON.parse(body).key;
        res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
        res.end(key);
      } else {
        res.status(response.statusCode).end();
      }
    });
  }
}
