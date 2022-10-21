/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
/* eslint-disable unicorn/prefer-module */
import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import * as handlebars from 'handlebars';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { JwtService } from '@nestjs/jwt';
import { UserCreatePayloadDto } from '../dtos/UserCreateRequest.dto';
import { User, UserDocument } from '../user.schema';
import { ConflictException } from '../../../utils/exceptions/ConflictException';
import { ConfigService } from '../../../configs/config.service';
import { hashAndValidatePassword } from '../../../utils/hashUser';
import { MailSendGridService } from '../../mail/mail-send-grid.service';
import { UserConfirmationTokenDto } from '../dtos/UserConfirmationToken.dto';
import { USER_PROVIDER } from '../interfaces/user.interface';
import { RequestContext } from '../../../utils/RequestContext';
import { STATUS } from '../../../domain/const';

@Injectable()
export class UserCreateAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailSendGridService: MailSendGridService,
  ) {}

  async execute(context: RequestContext, payload: UserCreatePayloadDto): Promise<UserDocument> {
    const { email, password } = payload;
    const { correlationId } = context;
    const checkExistedUser = await this.userModel.findOne({ $or: [{ email }] });

    if (checkExistedUser) {
      throw new ConflictException('User has already conflicted');
    }

    const { saltRounds, mailForm, frontEndDomain } = this.configService;
    const hashPass = await hashAndValidatePassword(password, saltRounds);

    const user = await new this.userModel({
      ...payload,
      password: hashPass,
      status: STATUS.INACTIVE,
      provider: USER_PROVIDER.PASSWORD,
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

    const rootUrl = `${frontEndDomain}/confirmation`;
    const url = `${rootUrl}?token=${token}`;
    const filePath = path.join(__dirname, '../../../views/templates/mail/confirmation2.hbs');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      name: `${user.firstName} ${user.lastName}`,
      url,
      content: rootUrl,
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
