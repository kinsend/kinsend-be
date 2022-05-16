import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';

@Injectable()
export class UserFindByEmailAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async execute(email: string): Promise<User> {
    const user = await this.userModel.findOne({ $or: [{ email }] });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
