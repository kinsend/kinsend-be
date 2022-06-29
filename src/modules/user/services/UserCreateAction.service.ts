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
import {
  FormSubmission,
  FormSubmissionDocument,
} from '../../form.submission/form.submission.schema';
import { AutomationsGetByUserIdsAction } from '../../automation/services/AutomationsGetByUserIdsAction.service';
import { TRIGGER_TYPE } from '../../automation/interfaces/const';
import { AutomationTriggerContactCreatedAction } from '../../automation/services/AutomationTriggerAction/AutomationTriggerContactCreatedAction.service';

@Injectable()
export class UserCreateAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailSendGridService: MailSendGridService,
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    private automationsGetByUserIdsAction: AutomationsGetByUserIdsAction,
    private automationTriggerContactCreatedAction: AutomationTriggerContactCreatedAction,
  ) {}

  async execute(context: RequestContext, payload: UserCreatePayloadDto): Promise<any> {
    const { email, password } = payload;
    const { correlationId } = context;
    const checkExistedUser = await this.userModel.findOne({ $or: [{ email }] });

    if (checkExistedUser) {
      throw new ConflictException('User has already conflicted');
    }

    const { saltRounds, mailForm, baseUrl } = this.configService;
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
    this.checkTriggerAutomation(context, user as UserDocument);
    return user;
  }

  private async checkTriggerAutomation(context: RequestContext, user: UserDocument) {
    const formSubmissions = await this.formSubmissionModel
      .find({
        email: user.email,
      })
      .populate([{ path: 'owner', select: ['_id'] }]);
    const ownerId = formSubmissions.map((formSub) => formSub.owner._id.toString());
    const automations = await this.automationsGetByUserIdsAction.execute(
      context,
      ownerId,
      TRIGGER_TYPE.CONTACT_CREATED,
    );
    automations.forEach(async (automation) => {
      this.automationTriggerContactCreatedAction.execute(
        context,
        automation,
        user.email,
        user.phoneNumber[0],
      );
    });
  }
}
