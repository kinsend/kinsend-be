import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { User, UserDocument } from '../user.schema';

@Injectable()
export class UserFindByStripeCustomerUserIdAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async execute(stripeCustomerUserId: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      stripeCustomerUserId,
    });
    if (!user) {
      throw new NotFoundException('User', 'User not found');
    }
    return user;
  }
}
