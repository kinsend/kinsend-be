import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { UserDocument } from '../user.schema';
import { UserFindByIdAction } from './UserFindByIdAction.service';
import { ImageUploadAction } from '../../image/services/ImageUploadAction.service';
import { S3Service } from '../../../shared/services/s3.service';
import { ConfigService } from '../../../configs/config.service';

@Injectable()
export class UserUpdatePhotoAction {
  constructor(
    private userFindByIdAction: UserFindByIdAction,
    private imageUploadAction: ImageUploadAction,
    private s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async execute(context: RequestContext, photo: Express.Multer.File): Promise<UserDocument> {
    const { user } = context;
    const userInfo = await this.userFindByIdAction.execute(context, user.id);
    const fileName = `${Date.now()}${photo.originalname}`;
    const [imageUrl] = await Promise.all([
      this.imageUploadAction.execute(context, photo, fileName),
      this.deleteOldImage(context, userInfo),
    ]);

    userInfo.image = imageUrl;
    await userInfo.save();
    return userInfo;
  }

  private async deleteOldImage(context: RequestContext, user: UserDocument) {
    if (!user.image) {
      return;
    }

    const oldImageKey = user.image.replace(
      `https://${this.configService.awsBucket}.s3.amazonaws.com/`,
      '',
    );
    await this.s3Service.deleteFilesByKeys(context, [oldImageKey]);
  }
}
