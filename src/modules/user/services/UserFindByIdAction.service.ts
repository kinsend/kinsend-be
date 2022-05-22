import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestContext } from '../../../utils/RequestContext';
import { User, UserDocument } from '../user.schema';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';

@Injectable()
export class UserFindByIdAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async execute(context: RequestContext, id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User', 'User not found');
    }
    return user;
  }
}
