/* eslint-disable no-await-in-loop */
/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FormSubmission,
  FormSubmissionDocument,
} from 'src/modules/form.submission/form.submission.schema';
import * as schedule from 'node-schedule';
import { FormSubmissionFindByIdAction } from 'src/modules/form.submission/services/FormSubmissionFindByIdAction.service';
import { SqsService } from '@ssut/nestjs-sqs';
import { v4 as uuid } from 'uuid';
import { UpdateSchedule, UpdateScheduleDocument } from '../update.schedule.schema';
import { LinkRediectCreateByMessageAction } from './link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateUpdateProgressAction } from './UpdateUpdateProgressAction.service';
import { UpdateFindByIdWithoutReportingAction } from './UpdateFindByIdWithoutReportingAction.service';
import { UpdateDocument } from '../update.schema';
import { INTERVAL_TRIGGER_TYPE, UPDATE_PROGRESS } from '../interfaces/const';
import { MessageCreateAction } from '../../messages/services/MessageCreateAction.service';
import { RequestContext } from '../../../utils/RequestContext';
import { FormSubmissionUpdateLastContactedAction } from '../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { SmsService } from '../../../shared/services/sms.service';
import { fillMergeFieldsToMessage } from '../../../utils/fillMergeFieldsToMessage';
import { REGION_DOMESTIC, TYPE_MESSAGE } from '../../../domain/const';
import { getLinksInMessage } from '../../../utils/getLinksInMessage';
import { regionPhoneNumber } from '../../../utils/utilsPhoneNumber';
import { UpdateChargeMessageTriggerAction } from './UpdateTriggerAction/UpdateChargeMessageTriggerAction';

@Injectable()
export class UpdateHandleSendSmsAction {
  constructor(private readonly sqsService: SqsService) {}

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
    const { logger } = context;
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
    const chunks = subscribers.reduce((accumulator, _, index) => {
      if (index % 200 === 0) {
        accumulator.push(subscribers.slice(index, index + 200));
      }
      return accumulator;
    }, [] as FormSubmission[][]);

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

    const promises: Promise<AWS.SQS.SendMessageBatchResultEntryList | undefined>[] = chunks.map(
      async (subscriberChunk) => {
        try {
          const messageBody = {
            message: {
              subscribers: subscriberChunk,
              ownerPhoneNumber,
              ownerEmail: update.createdBy.email,
              update: update.id,
              scheduleName,
            },
          };

          const message = JSON.stringify(messageBody);
          Logger.log('Sending message', message);
          // eslint-disable-next-line @typescript-eslint/return-await
          return await this.sqsService.send('kinsend-dev', {
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

  private saveSms(
    context: RequestContext,
    from: string,
    to: string,
    message: string,
    file?: string,
    updateId?: string,
  ) {
    return (status = 'success', error?: string) =>
      this.messageCreateAction.execute(context, {
        content: message,
        updateId,
        dateSent: new Date(),
        isSubscriberMessage: false,
        status,
        fileAttached: file,
        phoneNumberSent: from,
        phoneNumberReceipted: to,
        errorMessage: error,
        typeMessage: !file ? this.handleTypeMessage(to) : TYPE_MESSAGE.MMS,
      });
  }

  private async handleGenerateLinkRedirect(
    update: UpdateDocument,
    subscriber: FormSubmission,
    context: RequestContext,
    linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
  ) {
    const links = getLinksInMessage(update.message);
    if (links.length === 0) {
      return null;
    }
    const linkCreated = await linkRediectCreateByMessageAction.execute(
      context,
      update,
      subscriber as FormSubmissionDocument,
    );
    return linkCreated.messageReview;
  }

  private handleTypeMessage(phoneNumberReceipted: string): TYPE_MESSAGE {
    const region = regionPhoneNumber(phoneNumberReceipted);
    if (!region || region === REGION_DOMESTIC) {
      return TYPE_MESSAGE.MESSAGE_UPDATE_DOMESTIC;
    }
    return TYPE_MESSAGE.MESSAGE_UPDATE_INTERNATIONAL;
  }
}
