import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from 'src/utils/RequestContext';
import { S3Service } from 'src/shared/services/s3.service';


@Injectable()
export class UserFindByIdAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private s3Service: S3Service) {}

  async execute(context: RequestContext,id: string, isFetchImage = false): Promise<UserDocument> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User', 'User not found');
    }
    if(isFetchImage){
      const imageKey = user.id + "photo";
      const image = await this.s3Service.getFile(context, imageKey);
      user.image = image;
    }
    return user;
  }
}
