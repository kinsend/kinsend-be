/* eslint-disable unicorn/import-style */
/* eslint-disable unicorn/prefer-node-protocol */
/* eslint-disable new-cap */
/* eslint-disable unicorn/prefer-module */
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import omit from 'lodash';
import * as mongoose from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../configs/config.service';
import { VerificationConfirmEmailQueryDto } from '../dtos/VerificationConfirmEmailQuery.dto';
import { StripeService } from '../../../shared/services/stripe.service';
import { ForbiddenException } from '../../../utils/exceptions/ForbiddenException';
import { RequestContext } from '../../../utils/RequestContext';
import { STATUS } from '../../../domain/const';
import { User, UserDocument } from '../../user/user.schema';
import { UserConfirmationTokenDto } from '../../user/dtos/UserConfirmationToken.dto';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';

@Injectable()
export class VerificationConfirmEmailAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
    private stripeService: StripeService,
    private jwtService: JwtService,
  ) {}

  async execute(
    context: RequestContext,
    query: VerificationConfirmEmailQueryDto,
  ): Promise<User | null> {
    try {
      const decodedJwtEmailToken = this.jwtService.decode(query.token);
      const { email } = <UserConfirmationTokenDto>decodedJwtEmailToken;
      const checkExistedUser = await this.userModel.findOne({ $or: [{ email }] });

      if (!checkExistedUser) {
        throw new NotFoundException('User', 'User not found');
      }

      if (checkExistedUser.status === STATUS.ACTIVE) {
        throw new ForbiddenException('User has already active');
      }

      if (checkExistedUser.stripeCustomerUserId) {
        throw new ForbiddenException('User has verified Stripe customer');
      }
      const fullName = `${checkExistedUser.firstName} ${checkExistedUser.lastName}`;
      const customerInfo = await this.stripeService.createCustomerUser(context, fullName, email);
      const user = await this.userModel.findByIdAndUpdate(checkExistedUser.id, {
        status: STATUS.ACTIVE,
        stripeCustomerUserId: customerInfo.id,
      });

      return user;
    } catch (error) {
      context.logger.error(error);
      throw new ForbiddenException(error.message || 'User token not found');
    }
  }
}
