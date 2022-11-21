/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodeSchedule from 'node-schedule';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { UpdateSchedule, UpdateScheduleDocument } from '../update.schedule.schema';
import { UPDATE_PROGRESS } from '../interfaces/const';
import { LinkRediectCreateByMessageAction } from './link.redirect/LinkRediectCreateByMessageAction.service';

import { UpdateFindByIdWithoutReportingAction } from './UpdateFindByIdWithoutReportingAction.service';
import { UpdateUpdateProgressAction } from './UpdateUpdateProgressAction.service';
import { UpdateHandleSendSmsAction } from './UpdateHandleSendSmsAction.service';
import { BackgroudJobService } from '../../../shared/services/backgroud.job.service';
import { FormSubmissionUpdateLastContactedAction } from '../../form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { SmsService } from '../../../shared/services/sms.service';
import { RequestContext } from '../../../utils/RequestContext';
import { rootLogger } from '../../../utils/Logger';

@Injectable()
export class UpdateReTriggerScheduleAction implements OnModuleInit {
  private logger = new Logger();
  @InjectModel(UpdateSchedule.name) private updateScheduleModel: Model<UpdateScheduleDocument>;
  @Inject() private backgroudJobService: BackgroudJobService;
  @Inject(UpdateHandleSendSmsAction) private updateHandleSendSmsAction: UpdateHandleSendSmsAction;
  @Inject(LinkRediectCreateByMessageAction)
  private linkRediectCreateByMessageAction: LinkRediectCreateByMessageAction;
  @Inject(FormSubmissionUpdateLastContactedAction)
  private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction;
  @Inject(SmsService) private smsService: SmsService;
  @Inject(UpdateUpdateProgressAction)
  private updateUpdateProgressAction: UpdateUpdateProgressAction;
  @Inject(UpdateFindByIdWithoutReportingAction)
  private updateFindByIdWithoutReportingAction: UpdateFindByIdWithoutReportingAction;

  onModuleInit() {
    this.handleCron();
  }
  async handleCron() {
    this.logger.debug('Running update schedule');
    const schedules = await this.updateScheduleModel
      .find({
        status: UPDATE_PROGRESS.SCHEDULED,
      })
      .populate(['subscribers', 'update']);
    const context: RequestContext = {
      logger: rootLogger,
      correlationId: '',
      user: {},
    };
    for (const schedule of schedules) {
      const {
        userId,
        datetimeSchedule,
        datetimeTrigger,
        scheduleName,
        update,
        ownerPhoneNumber,
        subscribers,
      } = schedule;
      const myJob = await nodeSchedule.scheduledJobs[scheduleName];
      if (myJob) {
        continue;
      }

      context.user.id = userId;
      this.backgroudJobService.job(
        datetimeSchedule,
        undefined,
        () =>
          this.updateHandleSendSmsAction.handleSendSms(
            context,
            this.linkRediectCreateByMessageAction,
            this.formSubmissionUpdateLastContactedAction,
            this.updateUpdateProgressAction,
            this.smsService,
            this.updateFindByIdWithoutReportingAction,
            ownerPhoneNumber,
            subscribers,
            update,
            datetimeTrigger,
            scheduleName,
          ),
        scheduleName,
      );
    }
  }
}
