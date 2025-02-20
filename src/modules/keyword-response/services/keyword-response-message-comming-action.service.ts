/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { MessageCreateAction } from '@app/modules//messages/services/MessageCreateAction.service';
import { RequestContext } from '@app/utils/RequestContext';
import { UserDocument } from '@app/modules/user/user.schema';
import { BackgroudJobService } from '@app/shared/services/backgroud.job.service';
import { SmsService } from '@app/shared/services/sms.service';
import { TaskDocument } from '@app/modules/automation/task.schema';
import { AutoKeyWordResponse, AutoKeyWordResponseDocument } from '../auto-keyword-response.schema';
import { KeywordResponse, KeywordResponseDocument } from '../keyword-response.schema';
import { AUTO_KEYWORD_RESPONSE_TYPE } from '../constant';
import { FormSubmissionUpdateLastContactedAction } from '@app/modules/form.submission/services/FormSubmissionUpdateLastContactedAction.service';

@Injectable()
export class KeywordResponseMessageCommingAction {
  private logger = new Logger(KeywordResponseMessageCommingAction.name);
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
    this.logger.debug({ userId: user.id, to, content });
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
      this.logger.debug(
        'Skip keyword response message because keywordResponseDocument not active or undifined',
      );
      return;
    }
    if (!user.phoneSystem) {
      return;
    }
    const phoneNumberOwner = user.phoneSystem[0];
    const from = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;

    if (!keywordResponseDocument || !keywordResponseDocument.autoKeywordResponses) {
      this.logger.debug('Skip keyword response message because no compatible data');
      return;
    }
    const autoKeywordResponse = this.handleTaskResponse(
      content,
      keywordResponseDocument.autoKeywordResponses,
    );
    if (!autoKeywordResponse) {
      this.logger.debug('Skip keyword response message because no compatible data after handle');
      return;
    }
    const { type, _id, response, pattern, index } = autoKeywordResponse;
    this.logger.debug(JSON.stringify({ _id, type, pattern, index, response }));
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
