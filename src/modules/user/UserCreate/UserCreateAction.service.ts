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
import { STATUS } from 'src/domain/const';
import { UserCreatePayloadDto } from './UserCreateRequest.dto';
import { User, UserDocument } from '../user.schema';
import { UsernameConflictException } from '../../../utils/exceptions/UsernameConflictException';
import { ConfigService } from '../../../configs/config.service';
import { hashAndValidatePassword } from '../../../utils/hashUser';
import { MailService } from '../../mail/mail.service';
import { MailSendGridService } from '../../mail/mail-send-grid.service';
import { UserConfirmationTokenDto } from './UserConfirmationToken.dto';

@Injectable()
export class UserCreateAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
    private mailService: MailService,
    private jwtService: JwtService,

    private mailSendGridService: MailSendGridService,
  ) {}

  async execute(context: RequestContext, payload: UserCreatePayloadDto): Promise<User> {
    const { email, password } = payload;
    const { correlationId } = context;
    const checkExistedUser = await this.userModel.findOne({ $or: [{ email }] });

    if (checkExistedUser) {
      throw new UsernameConflictException('User has already conflicted');
    }

    const { saltRounds, mailForm, baseUrl } = this.configService;
    const hashPass = await hashAndValidatePassword(password, saltRounds);

    const user = await new this.userModel({
      ...payload,
      password: hashPass,
      status: STATUS.INACTIVE,
    }).save();

    const { jwtSecret, accessTokenExpiry } = this.configService;
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
      subject: 'Verify register account!',
      from: mailForm,
      html: htmlToSend,
    };

    this.mailSendGridService.sendUserConfirmation(mail);
    return user;
  }
}
