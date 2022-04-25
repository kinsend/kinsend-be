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
import { RequestContext } from 'src/utils/RequestContext';
import { User, UserDocument } from '../user.schema';
import { UsernameConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { ConfigService } from '../../../configs/config.service';
import { MailSendGridService } from '../../mail/mail-send-grid.service';
import { UserConfirmationTokenDto } from '../dtos/UserConfirmationToken.dto';
import { STATUS } from '../../../domain/const';

@Injectable()
export class UserResendEmailAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailSendGridService: MailSendGridService,
  ) {}

  async execute(context: RequestContext, email: string): Promise<User> {
    const { correlationId } = context;
    const user = await this.userModel.findOne({ $and: [{ email }, { status: STATUS.INACTIVE }] });

    if (!user) {
      throw new UsernameConflictException('User not found');
    }

    const { jwtSecret, accessTokenExpiry, baseUrl, mailForm } = this.configService;
    const userConfirmationToken: UserConfirmationTokenDto = {
      id: user.id,
      email: user.email,
      correlationId,
    };

    const token = this.jwtService.sign(userConfirmationToken, {
      secret: jwtSecret,
      expiresIn: accessTokenExpiry,
    });

    const url = `${baseUrl}/api/verifications/confirm?token=${token}`;
    const filePath = path.join(__dirname, '../../../views/templates/mail/confirmation.hbs');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: `${user.firstName} ${user.lastName}`,
      url,
    };
    const htmlToSend = template(replacements);
    const mail = {
      to: user.email,
      subject: 'Re-send verify register account!',
      from: mailForm,
      html: htmlToSend,
    };

    this.mailSendGridService.sendUserConfirmation(mail);
    return user;
  }
}
