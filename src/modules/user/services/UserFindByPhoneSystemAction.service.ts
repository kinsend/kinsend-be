import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';
import { PhoneNumber } from '../dtos/UserResponse.dto';

@Injectable()
export class UserFindByPhoneSystemAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async execute(phone: PhoneNumber): Promise<UserDocument[]> {
    const user = await this.userModel.find({
      phoneSystem: { $elemMatch: { $and: [{ phone: phone.phone }, { code: phone.code }] } },
    });
    return user;
  }
}
