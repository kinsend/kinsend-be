/* eslint-disable unicorn/import-style */
/* eslint-disable unicorn/prefer-node-protocol */
/* eslint-disable new-cap */
/* eslint-disable unicorn/prefer-module */
import { Injectable, Res } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { UserCreatePayloadDto } from './UserCreateRequest.dto';
import { User, UserDocument } from '../user.schema';
import { UsernameConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { ConfigService } from '../../../configs/config.service';
import { hashAndValidatePassword } from '../../../utils/hashUser';
import { MailService } from '../../mail/mail.service';
import { MailSendGridService } from '../../mail/mail-send-grid.service';

@Injectable()
export class UserCreateAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
    private mailService: MailService,
    private mailSendGridService: MailSendGridService,
  ) {}

  async execute(payload: UserCreatePayloadDto): Promise<User> {
    const { email, password } = payload;
    const checkExistedUser = await this.userModel.findOne({ $or: [{ email }] });

    if (checkExistedUser) {
      throw new UsernameConflictException('User has already conflicted');
    }

    const { saltRounds, mailForm, baseUrl } = this.configService;
    const hashPass = await hashAndValidatePassword(password, saltRounds);

    const user = await new this.userModel({ ...payload, password: hashPass }).save();

    const url = `${baseUrl}/verification/confirm?token=${new Date().toISOString()}`;
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
      subject: 'Verify register account!',
      from: mailForm,
      html: htmlToSend,
    };

    this.mailSendGridService.sendUserConfirmation(mail);
    return user;
  }
}
