import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { AwsS3Service } from 'src/shared/services/AwsS3Service';
import { RequestContext } from 'src/utils/RequestContext';


@Injectable()
export class UserFindByIdAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private awsS3Service: AwsS3Service) {}

  async execute(context: RequestContext,id: string, isFetchImage = false): Promise<UserDocument> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User', 'User not found');
    }
    if(isFetchImage){
      const image = await this.awsS3Service.getImage(context, user.id);
      user.image = image;
    }
    return user;
  }
}
