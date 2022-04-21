import { Injectable, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserCreatePayloadDto } from './UserCreateRequest.dto';
import { User, UserDocument } from '../user.schema';
import { UsernameConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { ConfigService } from '../../../configs/config.service';
import { hashAndValidatePassword } from '../../../utils/hashUser';
import { MailService } from '../../mail/mail.service';
import { MailSendGridService } from '../../mail/mail-send-grid.service';
import { Response } from 'express';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
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
    const checkExistedUser = await this.userModel.findOne({ $or: [{ email: email }] });

    if (checkExistedUser) {
      throw new UsernameConflictException('User has already conflicted');
    }

    const { saltRounds } = this.configService;
    const hashPass = await hashAndValidatePassword(password, saltRounds);

    const user = await new this.userModel({ ...payload, password: hashPass }).save();

    const url = `example.com/auth/confirm?token=${new Date().toISOString()}`;
    const filePath = path.join(__dirname, '../../../views/templates/mail/confirmation.ejs');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = ejs.compile(source);
    const replacements = {
      name: `${user.firstName } ${user.lastName}`,
      url
    };
    const htmlToSend = template(replacements);
    // TODO: Update
    const mail = {
      to: "quochungphp@gmail.com",
      subject: 'Greeting Message from NestJS Sendgrid',
      from: 'kinsend.sp@gmail.com',
      text: 'Hello World from NestJS Sendgrid',
      html: htmlToSend
    };
    this.mailSendGridService.sendUserConfirmation(mail);
    return user;
  }
}
