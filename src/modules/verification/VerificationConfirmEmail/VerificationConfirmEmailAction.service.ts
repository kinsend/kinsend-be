/* eslint-disable unicorn/import-style */
/* eslint-disable unicorn/prefer-node-protocol */
/* eslint-disable new-cap */
/* eslint-disable unicorn/prefer-module */
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import omit from 'lodash';
import * as mongoose from 'mongoose';
import { RequestContext } from 'src/utils/RequestContext';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/modules/user/user.schema';
import { UserConfirmationTokenDto } from 'src/modules/user/UserCreate/UserConfirmationToken.dto';
import { NotFoundException } from 'src/utils/exceptions/NotFoundException';
import { STATUS } from 'src/domain/const';
import { IllegalStateException } from 'src/utils/exceptions/IllegalStateException';
import { ConfigService } from '../../../configs/config.service';
import { MailSendGridService } from '../../mail/mail-send-grid.service';
import { VerificationConfirmEmailQueryDto } from './VerificationConfirmEmailQuery.dto';

@Injectable()
export class VerificationConfirmEmailAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailSendGridService: MailSendGridService,
  ) {}

  async execute(
    context: RequestContext,
    query: VerificationConfirmEmailQueryDto,
  ): Promise<User | null> {
    try {
      const decodedJwtEmailToken = this.jwtService.decode(query.token);
      const { email, id } = <UserConfirmationTokenDto>decodedJwtEmailToken;
      const checkExistedUser = await this.userModel.findOne({ $or: [{ email }] });

      if (!checkExistedUser) {
        throw new NotFoundException('User', 'User not found');
      }

      let user = await this.userModel.findByIdAndUpdate(id, { status: STATUS.ACTIVE });
      user = omit('password', { ...user });
      return user;
    } catch (error) {
      context.logger.error(error);
      throw new IllegalStateException('User token not found');
    }
  }
}
