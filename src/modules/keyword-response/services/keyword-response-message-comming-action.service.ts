/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { MessageCreateAction } from 'src/modules/messages/services/MessageCreateAction.service';
import { RequestContext } from '../../../utils/RequestContext';
import { UserDocument } from '../../user/user.schema';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { now } from '../../../utils/nowDate';
import { FormSubmissionFindByPhoneNumberAction } from '../../form.submission/services/FormSubmissionFindByPhoneNumberAction.service';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { SmsService } from '../../../shared/services/sms.service';
import { TaskDocument } from '../../automation/task.schema';
import { KeywordResponseGetAction } from './keyword-response-get-action.service';
import { AutoKeyWordResponse, AutoKeyWordResponseDocument } from '../auto-keyword-response.schema';
import { KeywordResponse, KeywordResponseDocument } from '../keyword-response.schema';
import { AUTO_KEYWORD_RESPONSE_TYPE } from '../constant';

@Injectable()
export class KeywordResponseMessageCommingAction {
  private logger = new Logger(KeywordResponseMessageCommingAction.name);

  constructor(
    @InjectModel(KeywordResponse.name)
    private keywordResponseDocument: Model<KeywordResponseDocument>,

    @InjectModel(AutoKeyWordResponse.name)
    private autoKeyWordResponseDocument: Model<AutoKeyWordResponseDocument>,
    private smsService: SmsService,
    private messageCreateAction: MessageCreateAction,
  ) {}

  async execute(
    context: RequestContext,
    user: UserDocument,
    to: string,
    content: string,
  ): Promise<void> {
    console.log('content :>> ', content);
    const keywordResponseDocument = await this.keywordResponseDocument
      .findOne({
        createdBy: user.id,
      })
      .populate({
        path: 'autoKeywordResponses',
        populate: {
          path: 'response',
        },
      });
    if (!keywordResponseDocument || !keywordResponseDocument.isEnable) {
      return;
    }
    if (!user.phoneSystem) {
      return;
    }
    console.log('keywordResponseDocument :>> ', keywordResponseDocument);
    const phoneNumberOwner = user.phoneSystem[0];
    const from = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;
    this.handleTaskResponse(content, keywordResponseDocument);
  }
  private handleTaskResponse(content: string, keywordResponseDocument: KeywordResponseDocument) {
    const contentArr = content.split(' ');
    let hashtagOrEnmojiMatches: AutoKeyWordResponseDocument[] = [];
    let regexMatches: AutoKeyWordResponseDocument[] = [];
    contentArr.forEach((item) => {
      keywordResponseDocument.autoKeywordResponses?.forEach((keyword) => {
        if (keyword.response.message === item) {
          if (keyword.type === AUTO_KEYWORD_RESPONSE_TYPE.REGEX) {
            hashtagOrEnmojiMatches.push(keyword);
          } else {
            regexMatches.push(keyword);
          }
        }
      });
    });
    console.log('hashtagOrEnmojiMatches :>> ', hashtagOrEnmojiMatches);
    console.log('regexMatches :>> ', hashtagOrEnmojiMatches);
  }

  //   private handleReminderTask(
  //     context: RequestContext,
  //     user: UserDocument,
  //     from: string,
  //     to: string,
  //   ) {
  //     return async () => {
  //       const firstContact = await this.firstContactDocument
  //         .findOne({
  //           createdBy: user.id,
  //         })
  //         .populate(['firstTask', 'reminderTask']);
  //       if (!firstContact || !firstContact.isEnable || !firstContact.reminderTask) {
  //         this.logger.log(`Skip reminder task for ${to}`);
  //         return;
  //       }
  //       const subscribers = await this.formSubmissionFindByPhoneNumberAction.execute(
  //         context,
  //         convertStringToPhoneNumber(to),
  //         user.id,
  //       );
  //       if (subscribers.length !== 0) {
  //         this.logger.log(`Skip reminder task for ${to}`);
  //       }
  //       this.logger.log(`Send reminder task for ${to}`);
  //       await this.sendTask(context, from, to, firstContact.reminderTask);
  //     };
  //   }

  //   private async sendTask(context: RequestContext, from: string, to: string, task: TaskDocument) {
  //     await this.smsService.sendMessage(
  //       context,
  //       from,
  //       task.message || '',
  //       task.fileAttached,
  //       to,
  //       undefined,
  //       this.saveSms(context, from, to, task),
  //     );
  //   }

  //   private saveSms(context: RequestContext, from: string, to: string, task: TaskDocument) {
  //     const { message, fileAttached } = task;
  //     return () =>
  //       this.messageCreateAction.execute(context, {
  //         content: message as string,
  //         dateSent: new Date(),
  //         isSubscriberMessage: false,
  //         status: 'success',
  //         fileAttached,
  //         phoneNumberSent: from,
  //         phoneNumberReceipted: to,
  //       });
  //   }
}
