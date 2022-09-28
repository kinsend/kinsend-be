import { Injectable } from '@nestjs/common';
import { S3Service } from '../../../shared/services/s3.service';
import { RequestContext } from '../../../utils/RequestContext';
import { UserFindByIdAction } from './UserFindByIdAction.service';

@Injectable()
export class UserDeletePhotoAction {
  constructor(private userFindByIdAction: UserFindByIdAction, private s3Service: S3Service) {}

  async execute(context: RequestContext): Promise<void> {
    const { user } = context;
    await this.userFindByIdAction.execute(context, user.id);
    const imageKey = `${user.id}photo`;
    await this.s3Service.deleteFilesByKeys(context, [imageKey]);
  }
}
