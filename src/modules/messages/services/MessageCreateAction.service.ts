/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionFindByPhoneNumberAction } from '../../form.submission/services/FormSubmissionFindByPhoneNumberAction.service';
import { UserFindByPhoneSystemAction } from '../../user/services/UserFindByPhoneSystemAction.service';
import { MessageCreatePayloadDto } from '../dtos/MessageCreatePayloadDto.dto';
import { Message, MessageDocument } from '../message.schema';

@Injectable()
export class MessageCreateAction {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction,
    private userFindByPhoneSystemAction: UserFindByPhoneSystemAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: MessageCreatePayloadDto,
  ): Promise<MessageDocument> {
    const { isSubscriberMessage, phoneNumberReceipted, phoneNumberSent } = payload;
    const subscriber = await this.formSubmissionFindByPhoneNumberAction.execute(
      context,
      convertStringToPhoneNumber(isSubscriberMessage ? phoneNumberSent : phoneNumberReceipted),
    );

    const userModel = await this.userFindByPhoneSystemAction.execute(
      convertStringToPhoneNumber(isSubscriberMessage ? phoneNumberReceipted : phoneNumberSent),
    );
    return new this.messageModel({
      ...payload,
      formSubmission: subscriber,
      user: userModel[0],
    }).save();
  }
}
