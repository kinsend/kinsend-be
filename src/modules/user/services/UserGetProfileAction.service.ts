import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { User, UserDocument } from '../user.schema';

@Injectable()
export class UserGetProfileAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async execute(context: RequestContext): Promise<User> {
    const { user } = context;
    const userProfile = await this.userModel.findById(user.id);

    if (!userProfile) {
      throw new NotFoundException('User', 'User not found');
    }

    return userProfile;
  }
}
