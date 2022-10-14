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
import {
  MessageCreatePayloadDto,
  MessageTestCreatePayloadDto,
} from '../dtos/MessageCreatePayloadDto.dto';
import { Message, MessageDocument } from '../message.schema';

@Injectable()
export class MessageTestCreateAction {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction,
    private userFindByPhoneSystemAction: UserFindByPhoneSystemAction,
  ) {}

  async execute(context: RequestContext, payload: MessageTestCreatePayloadDto): Promise<void> {
    console.log('vo messs');
    const {
      isSubscriberMessage,
      phoneNumberReceipted,
      phoneNumberSent,
      fileAttached,
      typeMessage,
    } = payload;
    const subscribers = await this.formSubmissionFindByPhoneNumberAction.execute(
      context,
      convertStringToPhoneNumber(isSubscriberMessage ? phoneNumberSent : phoneNumberReceipted),
    );

    const userModel = await this.userFindByPhoneSystemAction.execute(
      convertStringToPhoneNumber(isSubscriberMessage ? phoneNumberReceipted : phoneNumberSent),
    );
    const subscriber = this.getSubcriberByOwner(subscribers, userModel[0]);
    const type = typeMessage ? typeMessage : fileAttached ? TYPE_MESSAGE.MMS : undefined;
    for (let index = 0; index < payload.numberMessage; index++) {
      await new this.messageModel({
        ...payload,
        typeMessage: type,
        formSubmission: subscriber,
        user: userModel[0],
      }).save();
    }
  }

  private getSubcriberByOwner(subscribers: FormSubmissionDocument[], owner: UserDocument) {
    const subs = subscribers.filter((sub) => sub.owner.toString() === owner._id.toString());
    return subs[0];
  }
}
