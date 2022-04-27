import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IllegalStateException } from '../../../utils/exceptions/IllegalStateException';
import { RequestContext } from '../../../utils/RequestContext';
import { User, UserDocument } from '../user.schema';

@Injectable()
export class UserUpdateStripeCustomerIdAction {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async execute(context: RequestContext, id: string, stripeCustomerUserId: string): Promise<User> {
    const { correlationId, logger } = context;
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new NotFoundException('User Not Found');
      }

      await user.update({ stripeCustomerUserId });

      return user;
    } catch (error) {
      const message = 'Update stripe customer id not successful';
      logger.error({
        message,
        correlationId,
        error,
      });

      throw new IllegalStateException(message);
    }
  }
}
