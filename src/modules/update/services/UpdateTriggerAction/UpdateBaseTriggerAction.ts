/* eslint-disable no-plusplus */
/* eslint-disable new-cap */
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { buildCronSchedule } from '../../../../utils/buildCronSchedule';
import { RequestContext } from '../../../../utils/RequestContext';
import { INTERVAL_TRIGGER_TYPE } from '../../interfaces/const';
import { UpdateDocument } from '../../update.schema';
import { FormSubmission } from '../../../form.submission/form.submission.schema';
import { fillMergeFieldsToMessage } from '../../../../utils/fillMergeFieldsToMessage';

export class UpdateBaseTriggerAction {
  private timesPerformedOtherWeek = 0;

  private timesPerformedOtherDay = 0;

  async executeTrigger(
    context: RequestContext,
    ownerPhoneNumber: string,
    subscribers: FormSubmission[],
    update: UpdateDocument,
    backgroudJobService: BackgroudJobService,
    smsService: SmsService,
  ): Promise<void> {
    const { logger } = context;
    const { triggerType: interval, datetime } = update;
    logger.info('Interval trigger type: ', interval);

    switch (interval) {
      case INTERVAL_TRIGGER_TYPE.ONCE: {
        this.createScheduleTrigger(
          context,
          ownerPhoneNumber,
          subscribers,
          update,
          datetime,
          backgroudJobService,
          smsService,
        );
        break;
      }

      case INTERVAL_TRIGGER_TYPE.EVERY_DAY: {
        const sronSchedule = buildCronSchedule(
          datetime.getMinutes().toString(),
          datetime.getHours().toString(),
        );
        this.createScheduleTrigger(
          context,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          backgroudJobService,
          smsService,
        );
        break;
      }

      case INTERVAL_TRIGGER_TYPE.EVERY_OTHER_DAY: {
        const sronSchedule = buildCronSchedule(
          datetime.getMinutes().toString(),
          datetime.getHours().toString(),
        );
        this.createScheduleTrigger(
          context,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          backgroudJobService,
          smsService,
        );
        break;
      }

      case INTERVAL_TRIGGER_TYPE.EVERY_WEEK: {
        const sronSchedule = buildCronSchedule(
          datetime.getMinutes().toString(),
          datetime.getHours().toString(),
          undefined,
          undefined,
          datetime.getDay().toString(),
        );
        this.createScheduleTrigger(
          context,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          backgroudJobService,
          smsService,
        );
        break;
      }

      case INTERVAL_TRIGGER_TYPE.EVERY_OTHER_WEEK: {
        const sronSchedule = buildCronSchedule(
          datetime.getMinutes().toString(),
          datetime.getHours().toString(),
          undefined,
          undefined,
          datetime.getDay().toString(),
        );
        this.createScheduleTrigger(
          context,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          backgroudJobService,
          smsService,
        );
        break;
      }

      case INTERVAL_TRIGGER_TYPE.EVERY_MONTH: {
        const sronSchedule = buildCronSchedule(
          datetime.getMinutes().toString(),
          datetime.getHours().toString(),
          datetime.getDate().toString(),
        );
        this.createScheduleTrigger(
          context,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          backgroudJobService,
          smsService,
        );
        break;
      }

      case INTERVAL_TRIGGER_TYPE.EVERY_3_MONTHS: {
        const sronSchedule = buildCronSchedule(
          datetime.getMinutes().toString(),
          datetime.getHours().toString(),
          datetime.getDate().toString(),
          '*/3',
        );
        this.createScheduleTrigger(
          context,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          backgroudJobService,
          smsService,
        );
        break;
      }

      case INTERVAL_TRIGGER_TYPE.EVERY_YEAR: {
        const sronSchedule = buildCronSchedule(
          datetime.getMinutes().toString(),
          datetime.getHours().toString(),
          datetime.getDate().toString(),
          datetime.getMonth().toString(),
        );
        this.createScheduleTrigger(
          context,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          backgroudJobService,
          smsService,
        );
        break;
      }

      default: {
        logger.info(`Interval trigger type ${interval} not suport`);
        break;
      }
    }
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

  private handleSendSms(
    context: RequestContext,
    ownerPhoneNumber: string,
    subscribers: FormSubmission[],
    update: UpdateDocument,
    smsService: SmsService,
  ) {
    const { logger } = context;
    return async () => {
      if (this.isSkipTrigger(context, update.triggerType)) {
        return;
      }
      logger.info(`Sending sms to subscribers. Interval: ${update.triggerType}`);
      await Promise.all(
        subscribers.map((sub) => {
          const { phoneNumber, firstName, lastName } = sub;
          const to = `+${phoneNumber.code}${phoneNumber.phone}`;
          const messageFilled = fillMergeFieldsToMessage(update.message, {
            fname: firstName,
            lname: lastName,
            name: firstName + lastName,
            mobile: to,
          });
          return smsService.sendMessage(
            context,
            ownerPhoneNumber,
            messageFilled,
            undefined,
            to,
            `api/hook/sms/update/status/${update.id}`,
          );
        }),
      );
    };
  }

  private createScheduleTrigger(
    context: RequestContext,
    ownerPhoneNumber: string,
    subscribers: FormSubmission[],
    update: UpdateDocument,
    datatime: Date | string,
    backgroudJobService: BackgroudJobService,
    smsService: SmsService,
  ) {
    backgroudJobService.job(
      datatime,
      undefined,
      this.handleSendSms(context, ownerPhoneNumber, subscribers, update, smsService),
    );
  }
}
