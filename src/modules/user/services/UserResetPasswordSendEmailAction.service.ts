/* eslint-disable unicorn/import-style */
/* eslint-disable unicorn/prefer-node-protocol */
/* eslint-disable new-cap */
/* eslint-disable unicorn/prefer-module */
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../user.schema';
import { ConfigService } from '../../../configs/config.service';
import { MailSendGridService } from '../../mail/mail-send-grid.service';
import { UserConfirmationTokenDto } from '../dtos/UserConfirmationToken.dto';
import { STATUS } from '../../../domain/const';
import { RequestContext } from '../../../utils/RequestContext';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { UserResetPassword } from '../dtos/UserResetPassword.dto';

@Injectable()
export class UserResetPasswordSendEmailAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailSendGridService: MailSendGridService,
  ) {}

  async execute(context: RequestContext, payload: UserResetPassword): Promise<string> {
    const { correlationId } = context;
    const user = await this.userModel.findOne({
      email: payload.email,
    });

    if (!user) {
      throw new NotFoundException('User', 'User not found');
    }

    const { jwtSecret, accessTokenVerifyExpiry, baseUrl, mailForm, frontEndDomain } =
      this.configService;
    const userConfirmationToken: UserConfirmationTokenDto = {
      id: user.id,
      email: user.email,
      correlationId,
    };

    const token = this.jwtService.sign(userConfirmationToken, {
      secret: jwtSecret,
      expiresIn: accessTokenVerifyExpiry,
    });

    const rootUrl = `${frontEndDomain}/forgot-password/reset`;
    const url = `${rootUrl}?token=${token}`;
    const filePath = path.join(__dirname, '../../../views/templates/mail/reset-password.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: `${user.firstName} ${user.lastName}`,
      url,
      content_link: rootUrl,
    };

    const htmlToSend = template(replacements);
    const mail = {
      to: user.email,
      subject: 'Send email reset password',
      from: mailForm,
      html: htmlToSend,
    };

    this.mailSendGridService.sendUserConfirmation(mail);
    return 'Send email reset password successfull!';
  }
}
