/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TYPE_MESSAGE } from '../../../domain/const';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionDocument } from '../../form.submission/form.submission.schema';
import { FormSubmissionFindByPhoneNumberAction } from '../../form.submission/services/FormSubmissionFindByPhoneNumberAction.service';
import { UserFindByPhoneSystemAction } from '../../user/services/UserFindByPhoneSystemAction.service';
import { UserDocument } from '../../user/user.schema';
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

    const {
      isSubscriberMessage,
      phoneNumberReceipted,
      phoneNumberSent,
      fileAttached,
      typeMessage,
    } = payload;

    context.logger.info("Triggering MessageCreateAction");

    const subscriberNumber = convertStringToPhoneNumber(isSubscriberMessage ? phoneNumberSent : phoneNumberReceipted);
    const phoneSystemNumber = convertStringToPhoneNumber(isSubscriberMessage ? phoneNumberReceipted : phoneNumberSent);

    const subscribers = await this.formSubmissionFindByPhoneNumberAction.execute(
      context,
      subscriberNumber,
    );
    if(!subscribers || subscribers.length === 0) {
      context.logger.warn(`formSubmissionFindByPhoneNumberAction could not find subscriber number ${JSON.stringify(subscriberNumber)}`);
    }

    const userModel = await this.userFindByPhoneSystemAction.execute(phoneSystemNumber);
    if(!userModel || userModel.length === 0) {
      context.logger.error(`userFindByPhoneSystemAction could not find number ${JSON.stringify(phoneSystemNumber)}`)
    }

    const subscriber = this.getSubcriberByOwner(subscribers, userModel[0]);
    const type = typeMessage ? typeMessage : fileAttached ? TYPE_MESSAGE.MMS : undefined;

    return new this.messageModel({
      ...payload,
      typeMessage: type,
      formSubmission: subscriber,
      user: userModel[0],
    }).save();

  }

  private getSubcriberByOwner(subscribers: FormSubmissionDocument[], owner: UserDocument) {
    const subs = subscribers.filter((sub) => sub.owner.toString() === owner._id.toString());
    return subs[0];
  }
}
