import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { UserDocument } from '../user.schema';
import { UserFindByIdAction } from './UserFindByIdAction.service';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';

@Injectable()
export class UserUpdatePhotoAction {
  constructor(
    private userFindByIdAction: UserFindByIdAction,
    private imageUploadAction: ImageUploadAction,
  ) {}

  async execute(context: RequestContext, photo: Express.Multer.File): Promise<UserDocument> {
    const { user } = context;
    const userInfo = await this.userFindByIdAction.execute(context, user.id);
    const fileName = `${user.id}photo`;
    const imageUrl = await this.imageUploadAction.execute(context, photo, fileName);
    userInfo.image = imageUrl;
    await userInfo.save();
    return userInfo;
  }
}
