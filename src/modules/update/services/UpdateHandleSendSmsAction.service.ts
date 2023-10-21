/* eslint-disable import/order */
/* eslint-disable curly */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable prettier/prettier */
/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SqsService } from '@ssut/nestjs-sqs';
import { Model } from 'mongoose';
import * as schedule from 'node-schedule';
import {
  PRICE_PER_MESSAGE_DOMESTIC,
  PRICE_PER_MESSAGE_INTERNATIONAL,
  RATE_CENT_USD,
  REGION_DOMESTIC,
  TYPE_MESSAGE,
} from 'src/domain/const';
import { FormSubmission } from 'src/modules/form.submission/form.submission.schema';
import { FormSubmissionFindByIdAction } from 'src/modules/form.submission/services/FormSubmissionFindByIdAction.service';
import { fillMergeFieldsToMessage } from 'src/utils/fillMergeFieldsToMessage';
import { regionPhoneNumber } from 'src/utils/utilsPhoneNumber';
import { v4 as uuid } from 'uuid';
import { SmsService } from '../../../shared/services/sms.service';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionUpdateLastContactedAction } from '../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { MessageCreateAction } from '../../messages/services/MessageCreateAction.service';
import { INTERVAL_TRIGGER_TYPE, UPDATE_PROGRESS } from '../interfaces/const';
import { UpdateSchedule, UpdateScheduleDocument } from '../update.schedule.schema';
import { UpdateDocument } from '../update.schema';
import { UpdateFindByIdWithoutReportingAction } from './UpdateFindByIdWithoutReportingAction.service';
import { UpdateChargeMessageTriggerAction } from './UpdateTriggerAction/UpdateChargeMessageTriggerAction';
import { UpdateUpdateProgressAction } from './UpdateUpdateProgressAction.service';
import { LinkRediectCreateByMessageAction } from './link.redirect/LinkRediectCreateByMessageAction.service';
import { MessageContext } from 'src/modules/subscription/interfaces/message.interface';
import { ConfigService as EnvConfigService } from '../../../configs/config.service';

@Injectable()
export class UpdateHandleSendSmsAction {
  constructor(
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService,
    private readonly envConfigService: EnvConfigService, // private smsService: SmsService,
  ) {}

  private timesPerformedOtherWeek = 0;

  private timesPerformedOtherDay = 0;

  // private readonly sqsService: SqsService;

  @Inject(MessageCreateAction) private messageCreateAction: MessageCreateAction;

  @Inject(UpdateChargeMessageTriggerAction)
  private updateChargeMessageTriggerAction: UpdateChargeMessageTriggerAction;

  @Inject(FormSubmissionFindByIdAction)
  private formSubmissionFindByIdAction: FormSubmissionFindByIdAction;

  @InjectModel(UpdateSchedule.name) private updateScheduleModel: Model<UpdateScheduleDocument>;

  async handleSendSms(
    context: RequestContext,
    linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
    formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
    updateUpdateProgressAction: UpdateUpdateProgressAction,
    smsService: SmsService,
    updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction,
    ownerPhoneNumber: string,
    subscribers: FormSubmission[],
    update: UpdateDocument,
    datetimeTrigger: Date,
    scheduleName: string,
  ): Promise<void> {
    if (!update) {
      return;
    }
    if (this.isSkipTrigger(context, update.triggerType)) {
      return;
    }

    const isCleanSchedule = await this.handleCleanSchedule(
      context,
      updateFindByIdWithoutReportingAction,
      update.id,
      datetimeTrigger,
    );

    if (isCleanSchedule) {
      return;
    }
    const { message: messageValue, fileUrl } = update;
    let totalPrice = 0;
    let totalNoOfSegments = 0;
    const messageDomestic: MessageContext = {
      totalMessages: 0,
      totalPrice: 0,
    };

    const mms: MessageContext = {
      totalMessages: 0,
      totalPrice: 0,
    };

    const messageInternational: MessageContext = {
      totalMessages: 0,
      totalPrice: 0,
    };
    const timeTriggerSchedule = new Date();
    const chunks = await subscribers.reduce(async (accumulatorPromise, currentValue, index) => {
      const accumulator = await accumulatorPromise;
      const { phoneNumber, firstName, lastName, email, _id } = currentValue;

      const to = `+${phoneNumber.code}${phoneNumber.phone}`;

      // FILLING MERGE FIELDS
      const messageFilled = fillMergeFieldsToMessage(messageValue, {
        fname: firstName,
        lname: lastName,
        name: firstName + lastName,
        mobile: to,
        email: email,
      });

      const typeMessage = !fileUrl ? this.handleTypeMessage(to) : TYPE_MESSAGE.MMS;

      // CALCULATING PRICE
      const noOfSegments = Math.floor(messageFilled?.length / 160) + 1;
      totalNoOfSegments += noOfSegments;
      if (
        typeMessage === TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC ||
        typeMessage === TYPE_MESSAGE.MESSAGE_DOMESTIC
      ) {
        totalPrice += noOfSegments * (PRICE_PER_MESSAGE_DOMESTIC * RATE_CENT_USD);
        messageDomestic.totalMessages += 1;
        messageDomestic.totalPrice += noOfSegments * (PRICE_PER_MESSAGE_DOMESTIC * RATE_CENT_USD);
      } else if (typeMessage === TYPE_MESSAGE.MMS) {
        totalPrice += this.envConfigService.priceMMS * RATE_CENT_USD;
        mms.totalMessages += 1;
        mms.totalPrice += this.envConfigService.priceMMS * RATE_CENT_USD;
      } else {
        // International
        const price = await this.handlePricePerMessage(context, to, smsService);
        totalPrice += Number(price) * noOfSegments * 2;
        messageInternational.totalMessages += 1;
        messageInternational.totalPrice += Number(price) * noOfSegments * 2;
      }

      if (index % 200 === 0) {
        accumulator.push(subscribers.slice(index, index + 200));
      }
      return accumulator;
    }, Promise.resolve([] as FormSubmission[][]));

    if (chunks.length === 0 && update.triggerType === INTERVAL_TRIGGER_TYPE.ONCE) {
      Logger.warn('Do not have a subscriber, marking update as done');
      // Note: update process for update type Once
      await updateUpdateProgressAction.execute(context, update.id, UPDATE_PROGRESS.DONE);
      await this.updateScheduleModel.updateOne(
        { scheduleName },
        {
          status: UPDATE_PROGRESS.DONE,
        },
      );
    }
    try {
      await this.updateChargeMessageTriggerAction.execute(
        context,
        update.id,
        timeTriggerSchedule,
        messageDomestic,
        totalPrice,
        mms,
        messageInternational,
        totalNoOfSegments,
      );
    } catch (error) {
      Logger.error(`Exception payment charges error by Stripe: ${error.message || error}`);
    }

    const promises: Promise<AWS.SQS.SendMessageBatchResultEntryList | undefined>[] = chunks.map(
      async (subscriberChunk, index) => {
        try {
          const messageBody = {
            message: {
              subscribers: subscriberChunk,
              ownerPhoneNumber,
              update: update.id,
              scheduleName,
            },
          };

          const message = JSON.stringify(messageBody);
          Logger.log(`Sending chunk#${index}`, message);
          // eslint-disable-next-line @typescript-eslint/return-await
          return await this.sqsService.send(`${this.configService.get('aws.sqsName')}`, {
            id: uuid(),
            body: {
              message: `${message}`,
              type: 'update',
              createdAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          Logger.error('Error sending message', error);
        }
      },
    );

    await Promise.all(promises);
  }

  private isSkipTrigger(context: RequestContext, triggerType: INTERVAL_TRIGGER_TYPE) {
    const { logger } = context;
    if (triggerType === INTERVAL_TRIGGER_TYPE.EVERY_OTHER_WEEK) {
      this.timesPerformedOtherWeek++;
      // Check run times equa 2
      if (this.timesPerformedOtherWeek % 2 !== 0) {
        logger.info('Skip trigger. Less than 2 weeks!');

        return true;
      }
      // Reset times
      this.timesPerformedOtherWeek = 0;
      return false;
    }

    if (triggerType === INTERVAL_TRIGGER_TYPE.EVERY_OTHER_DAY) {
      this.timesPerformedOtherDay++;
      // Check run times equa 2
      if (this.timesPerformedOtherDay % 2 !== 0) {
        logger.info('Skip trigger. Less than 2 days!');

        return true;
      }
      // Reset times
      this.timesPerformedOtherDay = 0;
      return false;
    }
    return false;
  }

  private async handleCleanSchedule(
    context: RequestContext,
    updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction,
    updateId: string,
    datetimeTrigger: Date,
  ) {
    try {
      const lastestUpdate = await updateFindByIdWithoutReportingAction.execute(context, updateId);
      const isMatchDate = lastestUpdate.updatedAt.getTime() === datetimeTrigger.getTime();
      if (!isMatchDate) {
        // clean
        context.logger.info('Clean schedule update', {
          updateId,
          versionAt: datetimeTrigger,
          reason: 'OutDate',
        });
        this.cleanJobByName(`${updateId}-${datetimeTrigger.getTime()}`);
        return true;
      }
    } catch {
      // clean
      context.logger.info('Clean schedule update', {
        updateId,
        versionAt: datetimeTrigger,
        reason: 'Update has been deleted',
      });
      this.cleanJobByName(`${updateId}-${datetimeTrigger.getTime()}`);
      return true;
    }
    return false;
  }

  private cleanJobByName(jobName: string) {
    const my_job = schedule.scheduledJobs[jobName];
    if (!my_job) {
      return;
    }
    my_job.cancel();
  }

  private handleTypeMessage(phoneNumberReceipted: string): TYPE_MESSAGE {
    const region = regionPhoneNumber(phoneNumberReceipted);
    if (!region || region === REGION_DOMESTIC) {
      return TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC;
    }
    return TYPE_MESSAGE.MESSAGE_UPDATE_INTERNATIONAL;
  }

  private async handlePricePerMessage(
    context: RequestContext,
    phone: string,
    smsService: SmsService,
  ): Promise<number> {
    const region = regionPhoneNumber(phone);
    if (!region) return PRICE_PER_MESSAGE_INTERNATIONAL;
    const price = await smsService.getPriceSendMessage(context, region);
    // Convert to cent
    return price * RATE_CENT_USD;
  }
}
