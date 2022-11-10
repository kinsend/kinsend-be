import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { RequestContext } from '../../../utils/RequestContext';
import { convertFileToBase64 } from '../../../utils/imageBase64Helpers';
import { S3Service } from '../../../shared/services/s3.service';

@Injectable()
export class ImageUploadAction {
  constructor(private s3Service: S3Service) {}

  async execute(
    context: RequestContext,
    file: Express.Multer.File,
    fileName?: string,
    isResize?: boolean,
  ): Promise<string> {
    const awsKey = fileName || Date.now() + file.originalname;

    if (isResize) {
      const test = await sharp(file.buffer).resize(320, 240).jpeg().toBuffer();
      return this.s3Service.uploadFileBase64(
        context,
        test.toString('base64'),
        awsKey,
        file.mimetype,
      );
    }

    return this.s3Service.uploadFileBase64(
      context,
      convertFileToBase64(file),
      awsKey,
      file.mimetype,
    );
  }
}
