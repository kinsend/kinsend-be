/* eslint-disable unicorn/no-useless-undefined */
/* eslint-disable no-underscore-dangle */
import { Injectable, Logger } from '@nestjs/common';
import { TYPE_MESSAGE } from '../../../domain/const';
import { AutomationCreateTriggerAutomationAction } from '../../../modules/automation/services/AutomationCreateTriggerAutomationAction.service';
import { FirstContactCreateScheduleAction } from '../../../modules/first-contact/services/first-contact-create-schedule-action.service';
import { FirstContactGetByUserIdAction } from '../../../modules/first-contact/services/first-contact-get-by-user-id-action.service';
import {
  FormSubmission,
  FormSubmissionDocument,
} from '../../../modules/form.submission/form.submission.schema';
import { FormSubmissionFindByPhoneNumberAction } from '../../../modules/form.submission/services/FormSubmissionFindByPhoneNumberAction.service';
import { FormSubmissionUpdateAction } from '../../../modules/form.submission/services/FormSubmissionUpdateAction.service';
import { FormSubmissionUpdateLastContactedAction } from '../../../modules/form.submission/services/FormSubmissionUpdateLastContactedAction.service';
import { KeywordResponseMessageCommingAction } from '../../../modules/keyword-response/services/keyword-response-message-comming-action.service';
import { MessageCreateAction } from '../../../modules/messages/services/MessageCreateAction.service';
import { SmsLogCreateAction } from '../../../modules/sms.log/services/SmsLogCreateAction.service';
import { SmsLogsGetByFromAction } from '../../../modules/sms.log/services/SmsLogsGetByFromAction.service';
import { UpdateReportingUpdateByResponseAction } from '../../../modules/update/services/update.reporting/UpdateReportingUpdateByResponseAction.service';
import { UpdatesFindByCreatedByAction } from '../../../modules/update/services/UpdatesFindByCreatedByAction.service';
import { UpdateDocument } from '../../../modules/update/update.schema';
import { UserFindByPhoneSystemAction } from '../../../modules/user/services/UserFindByPhoneSystemAction.service';
import { UserDocument } from '../../../modules/user/user.schema';
import { convertStringToPhoneNumber } from '../../../utils/convertStringToPhoneNumber';
import { RequestContext } from '../../../utils/RequestContext';

@Injectable()
export class SmsReceiveHookAction {
  private logger = new Logger(SmsReceiveHookAction.name);
  constructor(
    private smsLogCreateAction: SmsLogCreateAction,
    private smsLogsGetByFromAction: SmsLogsGetByFromAction,
    private automationCreateTriggerAutomationAction: AutomationCreateTriggerAutomationAction,
    private userFindByPhoneSystemAction: UserFindByPhoneSystemAction,
    private updatesFindByCreatedByAction: UpdatesFindByCreatedByAction,
    private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction,
    private updateReportingUpdateByResponseAction: UpdateReportingUpdateByResponseAction,
    private formSubmissionUpdateLastContactedAction: FormSubmissionUpdateLastContactedAction,
    private messageCreateAction: MessageCreateAction,
    private formSubmissionUpdateAction: FormSubmissionUpdateAction,
    private firstContactGetByUserIdAction: FirstContactGetByUserIdAction,
    private firstContactCreateScheduleAction: FirstContactCreateScheduleAction,
    private keywordResponseMessageCommingAction: KeywordResponseMessageCommingAction,
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
      this.handleFirstContact(context, payload.From, payload.To, payload.Body),
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

    // Check content if equa DONE should unsubscribe
    if (payload.Body === 'DONE') {
      const formSubmission = await this.formSubmissionFindByPhoneNumberAction.execute(
        context,
        convertStringToPhoneNumber(payload.From),
        owner[0].id,
      );
      await this.formSubmissionUpdateAction.execute(context, formSubmission[0].id, {
        isSubscribed: false,
      });
      context.logger.debug(`Body equa DONE should unsubscribe ${payload.From}`);
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
      await this.saveSms(context, payload.From, payload.To, payload.Body);
    console.log("saveSms finished ===================");
      const createdBy = await this.userFindByPhoneSystemAction.execute(
        convertStringToPhoneNumber(payload.To),
      );
    console.log("userFindByPhoneSystemAction finished ===================");

      if (createdBy.length === 0) {
        return;
      }

      const updates = await this.updatesFindByCreatedByAction.execute(context, createdBy[0].id);
      console.log("updates from updatesFindByCreatedByAction", updates)
      if (updates.length === 0) {
        return;
      }
      console.log("updatesFindByCreatedByAction finished ===================");

      const subscribers = await this.formSubmissionFindByPhoneNumberAction.execute(
        context,
        convertStringToPhoneNumber(payload.From),
      );
      console.log("subscribers from formSubmissionFindByPhoneNumberAction", subscribers)
      console.log("formSubmissionFindByPhoneNumberAction finished ===================");

      const subscriber = this.getSubcriberByOwner(subscribers, createdBy[0]);
      console.log("subscriber from getSubcriberByOwner", subscriber);
      console.log("getSubcriberByOwner finished ===================");
      
      const updatesFiltered = this.filterUpdatesSubscribedbySubscriber(updates, subscriber);
      console.log("updatesFiltered from filterUpdatesSubscribedbySubscriber", updatesFiltered)
      console.log("filterUpdatesSubscribedbySubscriber finished ===================");

      await this.updateReportingUpdateByResponseAction.execute(
        context,
        updatesFiltered,
        subscriber,
        payload.Body,
      );
      console.log("updateReportingUpdateByResponseAction finished ===================");

    } catch (error) {
      context.logger.error({
        message: 'Handle sms receive update fail!',
        error,
      });
    }
  }
  private getSubcriberByOwner(subscribers: FormSubmissionDocument[], owner: UserDocument) {
    const subs = subscribers.filter((sub) => sub.owner.toString() === owner._id.toString());
    return subs[0];
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
  private async saveSms(
    context: RequestContext,
    from: string,
    to: string,
    content: string,
    type?: TYPE_MESSAGE,
  ) {
    console.log("saveSms started ===================");
    await Promise.all([
      this.formSubmissionUpdateLastContactedAction.execute(context, to, from),
      this.messageCreateAction.execute(context, {
        content,
        typeMessage: type,
        dateSent: new Date(),
        isSubscriberMessage: true,
        status: 'success',
        phoneNumberSent: from,
        phoneNumberReceipted: to,
      }),
    ]);
    console.log("saveSms finished ===================");
  }

  private async handleFirstContact(
    context: RequestContext,
    fromPhoneNumber: string,
    toPhoneNumber: string,
    body: string,
  ) {
    const owner = await this.userFindByPhoneSystemAction.execute(
      convertStringToPhoneNumber(toPhoneNumber),
    );
    if (!owner || owner.length === 0) {
      return;
    }
    return Promise.all([
      this.firstContactCreateScheduleAction.execute(context, owner[0], fromPhoneNumber),
      this.keywordResponseMessageCommingAction.execute(context, owner[0], fromPhoneNumber, body),
    ]);
  }
}
