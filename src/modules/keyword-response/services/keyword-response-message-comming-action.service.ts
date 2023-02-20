/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { MessageCreateAction } from 'src/modules/messages/services/MessageCreateAction.service';
import { RequestContext } from '../../../utils/RequestContext';
import { UserDocument } from '../../user/user.schema';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../shared/services/sms.service';
import { TaskDocument } from '../../automation/task.schema';
import { AutoKeyWordResponse, AutoKeyWordResponseDocument } from '../auto-keyword-response.schema';
import { KeywordResponse, KeywordResponseDocument } from '../keyword-response.schema';
import { AUTO_KEYWORD_RESPONSE_TYPE } from '../constant';
import { FormSubmissionUpdateLastContactedAction } from '../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';

@Injectable()
export class KeywordResponseMessageCommingAction {
  constructor(
    @InjectModel(KeywordResponse.name)
    private keywordResponseDocument: Model<KeywordResponseDocument>,
    private smsService: SmsService,
    private messageCreateAction: MessageCreateAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
  ) {}

  async execute(
    context: RequestContext,
    user: UserDocument,
    to: string,
    content: string,
  ): Promise<void> {
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
    const phoneNumberOwner = user.phoneSystem[0];
    const from = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;
    if (!keywordResponseDocument || !keywordResponseDocument.autoKeywordResponses) {
      return;
    }
    const autoKeywordResponse = this.handleTaskResponse(
      content,
      keywordResponseDocument.autoKeywordResponses,
    );
    if (!autoKeywordResponse) {
      return;
    }
    return this.sendTask(context, from, to, autoKeywordResponse.response);
  }
  private handleTaskResponse(content: string, autoKeywordResponses: AutoKeyWordResponseDocument[]) {
    const contentArr = content.split(' ');
    let hashtagOrEnmojiMatches: AutoKeyWordResponseDocument[] = [];
    let regexMatches: AutoKeyWordResponseDocument[] = [];
    contentArr.forEach((item) => {
      autoKeywordResponses.forEach((keyword) => {
        if (
          item.startsWith('#') &&
          keyword.type === AUTO_KEYWORD_RESPONSE_TYPE.HASHTAG_OR_EMOJI &&
          item.substring(1) === keyword.pattern
        ) {
          hashtagOrEnmojiMatches.push(keyword);
        }

        if (!item.startsWith('#')) {
          // Emoji
          if (
            keyword.type === AUTO_KEYWORD_RESPONSE_TYPE.HASHTAG_OR_EMOJI &&
            item === keyword.pattern
          ) {
            hashtagOrEnmojiMatches.push(keyword);
          }

          if (
            keyword.type === AUTO_KEYWORD_RESPONSE_TYPE.REGEX &&
            Array.isArray(item.match(keyword.pattern))
          ) {
            regexMatches.push(keyword);
          }
        }
      });
    });
    if (hashtagOrEnmojiMatches.length !== 0) {
      hashtagOrEnmojiMatches.sort((a, b) => a.index - b.index);
      return hashtagOrEnmojiMatches[0];
    }
    if (regexMatches.length !== 0) {
      regexMatches.sort((a, b) => a.index - b.index);
      return regexMatches[0];
    }
  }

  private async sendTask(context: RequestContext, from: string, to: string, task: TaskDocument) {
    await this.smsService.sendMessage(
      context,
      from,
      task.message || '',
      task.fileAttached,
      to,
      undefined,
      this.saveSms(context, from, to, task),
    );
    // Note: run async to update lastContacted
    this.formSubmissionUpdateLastContactedAction.execute(context, to, from);
  }

  private saveSms(context: RequestContext, from: string, to: string, task: TaskDocument) {
    const { message, fileAttached } = task;
    return () =>
      this.messageCreateAction.execute(context, {
        content: message as string,
        dateSent: new Date(),
        isSubscriberMessage: false,
        status: 'success',
        fileAttached,
        phoneNumberSent: from,
        phoneNumberReceipted: to,
      });
  }
}
