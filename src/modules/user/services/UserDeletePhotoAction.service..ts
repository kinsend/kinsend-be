import { Injectable } from '@nestjs/common';
import { AwsS3Service } from 'src/shared/services/AwsS3Service';
import { RequestContext } from '../../../utils/RequestContext';
import { UserDocument } from '../user.schema';
import { UserFindByIdAction } from './UserFindByIdAction.service';

@Injectable()
export class UserDeletePhotoAction {
  constructor(private userFindByIdAction: UserFindByIdAction, private awsS3Service: AwsS3Service) {}

  async execute(context: RequestContext): Promise<void> {
    const { user } = context;
    await this.userFindByIdAction.execute(context,user.id);
    const imageKey = user.id + 'photo';
    await this.awsS3Service.deleteFilesByKeys(context, [imageKey]);
  }
}
