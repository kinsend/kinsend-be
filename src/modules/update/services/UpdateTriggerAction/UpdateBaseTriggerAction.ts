/* eslint-disable curly */
/* eslint-disable no-plusplus */
/* eslint-disable new-cap */
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { buildCronSchedule } from '../../../../utils/buildCronSchedule';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormSubmission } from '../../../form.submission/form.submission.schema';
import { FormSubmissionUpdateLastContactedAction } from '../../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { MessageCreateAction } from '../../../messages/services/MessageCreateAction.service';
import { INTERVAL_TRIGGER_TYPE } from '../../interfaces/const';
import { UpdateSchedule, UpdateScheduleDocument } from '../../update.schedule.schema';
import { UpdateDocument } from '../../update.schema';
import { LinkRediectCreateByMessageAction } from '../link.redirect/LinkRediectCreateByMessageAction.service';
import { UpdateFindByIdWithoutReportingAction } from '../UpdateFindByIdWithoutReportingAction.service';
import { UpdateHandleSendSmsAction } from '../UpdateHandleSendSmsAction.service';
import { UpdateUpdateProgressAction } from '../UpdateUpdateProgressAction.service';
import { UpdateChargeMessageTriggerAction } from './UpdateChargeMessageTriggerAction';

export class UpdateBaseTriggerAction {
  @Inject(UpdateHandleSendSmsAction) private updateHandleSendSmsAction: UpdateHandleSendSmsAction;

  @InjectModel(UpdateSchedule.name) private updateScheduleModel: Model<UpdateScheduleDocument>;

  @Inject(UpdateChargeMessageTriggerAction)
  private updateChargeMessageTriggerAction: UpdateChargeMessageTriggerAction;

  async executeTrigger(
    context: RequestContext,
    backgroudJobService: BackgroudJobService,
    smsService: SmsService,
    linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
    formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
    updateUpdateProgressAction: UpdateUpdateProgressAction,
    updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction,
    ownerPhoneNumber: string,
    subscribers: FormSubmission[],
    update: UpdateDocument,
    datetimeTrigger: Date,
  ): Promise<void> {
    const { logger } = context;
    const { triggerType: interval, datetime } = update;
    logger.info('Interval trigger type: ', interval);

    switch (interval) {
      case INTERVAL_TRIGGER_TYPE.ONCE: {
        this.createScheduleTrigger(
          context,
          backgroudJobService,
          smsService,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          datetime,
          datetimeTrigger,
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
          backgroudJobService,
          smsService,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          datetimeTrigger,
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
          backgroudJobService,
          smsService,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          datetimeTrigger,
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
          backgroudJobService,
          smsService,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          datetimeTrigger,
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
          backgroudJobService,
          smsService,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          datetimeTrigger,
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
          backgroudJobService,
          smsService,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          datetimeTrigger,
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
          backgroudJobService,
          smsService,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          datetimeTrigger,
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
          backgroudJobService,
          smsService,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          sronSchedule,
          datetimeTrigger,
        );
        break;
      }

      default: {
        logger.info(`Interval trigger type ${interval} not suport`);
        break;
      }
    }
  }

  private async createScheduleTrigger(
    context: RequestContext,
    backgroudJobService: BackgroudJobService,
    smsService: SmsService,
    linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction,
    formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
    updateUpdateProgressAction: UpdateUpdateProgressAction,
    updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction,
    ownerPhoneNumber: string,
    subscribers: FormSubmission[],
    update: UpdateDocument,
    datetime: Date | string,
    datetimeTrigger: Date,
  ) {
    console.log('>>>>>>>>CREATE BG JOB???>>>>>>>');
    const scheduleName = `${update.id}-${datetimeTrigger.getTime()}`;
    backgroudJobService.job(
      datetime,
      undefined,
      () =>
        this.updateHandleSendSmsAction.handleSendSms(
          context,
          linkRediectCreateByMessageAction,
          formSubmissionUpdateLastContactedAction,
          updateUpdateProgressAction,
          smsService,
          updateFindByIdWithoutReportingAction,
          ownerPhoneNumber,
          subscribers,
          update,
          datetimeTrigger,
          scheduleName,
        ),
      scheduleName,
    );
    await new this.updateScheduleModel({
      userId: context.user.id,
      scheduleName,
      datetimeSchedule: datetime,
      ownerPhoneNumber,
      subscribers,
      update,
      datetimeTrigger,
    }).save();
  }
}
