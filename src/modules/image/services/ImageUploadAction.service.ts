import { Injectable } from '@nestjs/common';
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
  ): Promise<string> {
    const awsKey = fileName || Date.now() + file.originalname;
    return this.s3Service.uploadFileBase64(
      context,
      convertFileToBase64(file),
      awsKey,
      file.mimetype,
    );
  }
}
