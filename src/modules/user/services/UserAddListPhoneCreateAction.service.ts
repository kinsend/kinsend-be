/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IncomingPhoneNumberInstance } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';
import { RequestContext } from '../../../utils/RequestContext';
import { UserAddListPhonesRequest } from '../dtos/UserAddListPhonesRequest.dto';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { PhoneNumber } from '../dtos/UserResponse.dto';
import { SmsService } from '../../../shared/services/sms.service';
import { BadRequestException } from '../../../utils/exceptions/BadRequestException';
import { UserFindByPhoneSystemAction } from './UserFindByPhoneSystemAction.service';

@Injectable()
export class UserAddListPhoneCreateAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private smsService: SmsService,
    private userFindByPhoneSystemAction: UserFindByPhoneSystemAction,
  ) {}

  async execute(context: RequestContext, payload: UserAddListPhonesRequest): Promise<any> {
    const { phoneNumbers } = payload;
    const { user } = context;
    const userExist = await this.userModel.findById(user.id);
    if (!userExist) {
      throw new NotFoundException('User', 'User not found');
    }

    await this.checkPhoneNumbersExist(phoneNumbers);
    await this.checkPhoneNumbersAvailable(context, phoneNumbers);
    await this.buyPhoneNumbersAvailable(context, phoneNumbers);

    const phoneNumberUpdate = [...(userExist.phoneSystem as PhoneNumber[]), ...phoneNumbers];
    userExist.phoneSystem = phoneNumberUpdate as [PhoneNumber];
    await userExist.save();
    return userExist;
  }

  private async checkPhoneNumbersExist(phoneNumbers: PhoneNumber[]) {
    for (const phoneNumber of phoneNumbers) {
      const { code, phone } = phoneNumber;
      const exist = await this.userFindByPhoneSystemAction.execute(phoneNumber);
      if (exist.length > 0) {
        throw new BadRequestException(`Phone number +${code}${phone} already exists`);
      }
    }
  }

  private async checkPhoneNumbersAvailable(context: RequestContext, phoneNumbers: PhoneNumber[]) {
    for (const phoneNumber of phoneNumbers) {
      const { short, code, phone } = phoneNumber;
      const checked = await this.smsService.availablePhoneNumberTollFree(
        context,
        short,
        1,
        `${code}${phone}`,
      );
      if (checked.length === 0) {
        throw new BadRequestException('Phone number not available');
      }
    }
  }

  private async buyPhoneNumbersAvailable(
    context: RequestContext,
    phoneNumbers: PhoneNumber[],
  ): Promise<IncomingPhoneNumberInstance[]> {
    const response: IncomingPhoneNumberInstance[] = [];
    for (const phoneNumber of phoneNumbers) {
      const phoneBought = await this.smsService.buyPhoneNumber(context, phoneNumber);
      response.push(phoneBought);
    }
    return response;
  }
}
