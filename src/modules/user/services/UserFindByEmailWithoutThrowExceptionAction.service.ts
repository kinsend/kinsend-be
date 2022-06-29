import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';

@Injectable()
export class UserFindByEmailWithoutThrowExceptionAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async execute(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ $or: [{ email }] });
  }
}
