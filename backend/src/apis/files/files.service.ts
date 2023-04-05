import { Storage } from '@google-cloud/storage';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { getToday } from 'src/commons/utils/utils';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  async upload({ files }) {
    const waitedFiles = await Promise.all(files);
    const bucket = process.env.BUCKET;
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_PROJECT_KEY_FILENAME,
    }).bucket(bucket);

    //파일 올리기
    const results = await Promise.all(
      waitedFiles.map(
        (el) =>
          new Promise((resolve, reject) => {
            const fname = `${getToday()}/${uuidv4()}/${el.filename}`;
            el.createReadStream()
              .pipe(storage.file(fname).createWriteStream())
              .on('finish', () => resolve(`${bucket}/${fname}`))
              .on('error', () => reject('false'));
          }),
      ),
    );
    if (results.includes('false')) {
      throw new HttpException('이미지 업로드 오류', HttpStatus.CONFLICT);
    }
    return results; //성공하면 url, 실패하면 "실패"
  }

  async uploadOne({ file }) {
    const bucket = process.env.BUCKET;
    const storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_PROJECT_KEY_FILENAME,
    }).bucket(bucket);
    const fname = `${getToday()}/${uuidv4()}/origin/${file.filename}`;
    const fileName = await new Promise((resolve, reject) => {
      file
        .createReadStream()
        .pipe(storage.file(fname).createWriteStream())
        .on('finish', () => resolve(`${bucket}/${fname}`))
        .on('error', () => reject('false'));
    });
    if (fileName === 'false') {
      throw new HttpException('이미지 업로드 오류', HttpStatus.CONFLICT);
    }
    return fileName;
  }
}
