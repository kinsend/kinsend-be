/* eslint-disable unicorn/import-style */
/* eslint-disable unicorn/prefer-node-protocol */
/* eslint-disable new-cap */
/* eslint-disable unicorn/prefer-module */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import * as path from 'path';
import { MailSendGridService } from 'src/modules/mail/mail-send-grid.service';
import { ConfigService as ConfigServiceNest } from '@nestjs/config';
import { ConfigService } from '../../../configs/config.service';
import { STATUS } from '../../../domain/const';
import { StripeService } from '../../../shared/services/stripe.service';
import { RequestContext } from '../../../utils/RequestContext';
import { ForbiddenException } from '../../../utils/exceptions/ForbiddenException';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { UserConfirmationTokenDto } from '../../user/dtos/UserConfirmationToken.dto';
import { User, UserDocument } from '../../user/user.schema';
import { VerificationConfirmEmailQueryDto } from '../dtos/VerificationConfirmEmailQuery.dto';

@Injectable()
export class VerificationConfirmEmailAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private mailSendGridService: MailSendGridService,
    private configService: ConfigService,
    private readonly configServiceNest: ConfigServiceNest,
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
      const user = await this.userModel.findOne({ $or: [{ email }] });

      if (!user) {
        throw new NotFoundException('User', 'User not found');
      }

      if (user.status === STATUS.ACTIVE) {
        // TODO: Error message improvement
        throw new ForbiddenException('User has already active');
      }

      if (user.stripeCustomerUserId) {
        // TODO: Error message improvement
        throw new ForbiddenException('User has verified Stripe customer');
      }
      const fullName = `${user.firstName} ${user.lastName}`;
      const customerInfo = await this.stripeService.createCustomerUser(context, fullName, email);
      const updatedUser = await this.userModel.findByIdAndUpdate(user.id, {
        status: STATUS.ACTIVE,
        stripeCustomerUserId: customerInfo.id,
      });

      const { mailForm } = this.configService;
      const filePath = path.join(__dirname, '../../../views/templates/mail/welcome-email.html');
      const source = fs.readFileSync(filePath, 'utf-8').toString();
      const template = handlebars.compile(source);
      const replacements = {
        name: `${user.firstName}`,
        email,
        frontEndUrl: this.configServiceNest.get<string>('app.frontEndUrl'),
      };
      const htmlToSend = template(replacements);
      const mail = {
        to: email,
        from: mailForm,
        subject: 'Welcome to Kinsend',
        html: htmlToSend,
      };
      this.mailSendGridService.sendWelcomeEmail(mail);
      return updatedUser;
    } catch (error) {
      context.logger.error(error);
      throw new ForbiddenException(error.message || 'Missing or invalid token!');
    }
  }
}
