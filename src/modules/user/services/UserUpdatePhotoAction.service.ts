import { Injectable } from '@nestjs/common';
import { convertFileToBase64 } from 'src/utils/imageBase64Helpers';
import { S3Service } from 'src/shared/services/s3.service';
import { RequestContext } from '../../../utils/RequestContext';
import { UserDocument } from '../user.schema';
import { UserFindByIdAction } from './UserFindByIdAction.service';

@Injectable()
export class UserUpdatePhotoAction {
  constructor(private userFindByIdAction: UserFindByIdAction, private s3Service: S3Service) {}

  async execute(context: RequestContext, photo: Express.Multer.File): Promise<UserDocument> {
    const { user } = context;
    const userInfo = await this.userFindByIdAction.execute(context, user.id);
    const imageKey = `${user.id}photo`;
    await this.s3Service.uploadFileBase64(
      context,
      convertFileToBase64(photo),
      imageKey,
      photo.mimetype,
    );
    const image = await this.s3Service.getFile(context, imageKey);
    userInfo.image = image;
    return userInfo;
  }
}
