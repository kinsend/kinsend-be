/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable no-underscore-dangle */
import { Injectable } from '@nestjs/common';
import { AutomationCreateTriggerAutomationAction } from '../../../modules/automation/services/AutomationCreateTriggerAutomationAction.service';
import { FormSubmission } from '../../../modules/form.submission/form.submission.schema';
import { FormSubmissionFindByPhoneNumberAction } from '../../../modules/form.submission/services/FormSubmissionFindByPhoneNumberAction.service';
import { FormSubmissionUpdateLastContactedAction } from '../../../modules/form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { SmsLogCreateAction } from '../../../modules/sms.log/services/SmsLogCreateAction.service';
import { SmsLogsGetByFromAction } from '../../../modules/sms.log/services/SmsLogsGetByFromAction.service';
import { UpdateReportingUpdateByResponseAction } from '../../../modules/update/services/update.reporting/UpdateReportingUpdateByResponseAction.service';
import { UpdatesFindByCreatedByAction } from '../../../modules/update/services/UpdatesFindByCreatedByAction.service';
import { UpdateDocument } from '../../../modules/update/update.schema';
import { UserFindByPhoneSystemAction } from '../../../modules/user/services/UserFindByPhoneSystemAction.service';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class SmsReceiveHookAction {
  constructor(
    private smsLogCreateAction: SmsLogCreateAction,
    private smsLogsGetByFromAction: SmsLogsGetByFromAction,
    private automationCreateTriggerAutomationAction: AutomationCreateTriggerAutomationAction,
    private userFindByPhoneSystemAction: UserFindByPhoneSystemAction,
    private updatesFindByCreatedByAction: UpdatesFindByCreatedByAction,
    private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction,
    private updateReportingUpdateByResponseAction: UpdateReportingUpdateByResponseAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
  ) {}

  async execute(context: RequestContext, payload: any): Promise<void> {
    const { logger } = context;
    logger.info({
      event: 'Hook',
      message: 'Hook receive sms triggered',
      payload,
    });
    await Promise.all([
      this.handleTriggerAutomation(context, payload),
      this.smsLogCreateAction.execute(payload),
      this.handleSmsReceiveUpdate(context, payload),
    ]);
  }

  private async handleTriggerAutomation(context: RequestContext, payload: any) {
    const smsLog = await this.smsLogsGetByFromAction.execute(payload.From, payload.To);
    if (smsLog.length > 0) {
      return;
    }
    const owner = await this.userFindByPhoneSystemAction.execute(
      convertStringToPhoneNumber(payload.To),
    );
    if (owner.length === 0) {
      return;
    }

    await this.automationCreateTriggerAutomationAction.execute(
      context,
      owner[0],
      undefined,
      '',
      convertStringToPhoneNumber(payload.From),
      true,
    );
  }

  private async handleSmsReceiveUpdate(context: RequestContext, payload: any) {
    try {
      const createdBy = await this.userFindByPhoneSystemAction.execute(
        convertStringToPhoneNumber(payload.To),
      );
      if (createdBy.length === 0) {
        return;
      }

      const updates = await this.updatesFindByCreatedByAction.execute(context, createdBy[0].id);
      if (updates.length === 0) {
        return;
      }

      const subscriber = await this.formSubmissionFindByPhoneNumberAction.execute(
        context,
        convertStringToPhoneNumber(payload.From),
      );
      const updatesFiltered = this.filterUpdatesSubscribedbySubscriber(updates, subscriber);
      await this.updateReportingUpdateByResponseAction.execute(
        context,
        updatesFiltered,
        subscriber,
        payload.Body,
      );
      await this.formSubmissionUpdateLastContactedAction.execute(context, payload.From);
    } catch (error) {
      context.logger.error({
        message: 'Handle sms receive update fail!',
        error,
      });
    }
  }

  private filterUpdatesSubscribedbySubscriber(
    updates: UpdateDocument[],
    subscriber: FormSubmission,
  ) {
    return updates.filter((update) => {
      return update.recipients.some(
        (recipient) => recipient._id.toString() === subscriber._id.toString(),
      );
    });
  }
}
