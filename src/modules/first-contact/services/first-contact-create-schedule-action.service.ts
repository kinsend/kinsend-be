/* eslint-disable unicorn/explicit-length-check */
/* eslint-disable new-cap */
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { MessageCreateAction } from '@app/modules/messages/services/MessageCreateAction.service';
import { RequestContext } from '@app/utils/RequestContext';
import { FirstContact, FirstContactDocument } from '../first-contact.schema';
import { UserDocument } from '@app/modules/user/user.schema';
import { BackgroudJobService } from '@app/shared/services/backgroud.job.service';
import { now } from '@app/utils/nowDate';
import { FormSubmissionFindByPhoneNumberAction } from '@app/modules/form.submission/services/FormSubmissionFindByPhoneNumberAction.service';
import { convertStringToPhoneNumber } from '@app/utils/convertStringToPhoneNumber';
import { SmsService } from '@app/shared/services/sms.service';
import { TaskDocument } from '@app/modules/automation/task.schema';

@Injectable()
export class FirstContactCreateScheduleAction {
  private logger = new Logger(FirstContactCreateScheduleAction.name);

  constructor(
    @InjectModel(FirstContact.name) private firstContactDocument: Model<FirstContactDocument>,
    private backgroudJobService: BackgroudJobService,
    private formSubmissionFindByPhoneNumberAction: FormSubmissionFindByPhoneNumberAction,
    private smsService: SmsService,
    private messageCreateAction: MessageCreateAction,
  ) {}

  async execute(context: RequestContext, user: UserDocument, to: string): Promise<void> {
    const firstContact = await this.firstContactDocument
      .findOne({
        createdBy: user.id,
      })
      .populate(['firstTask', 'reminderTask']);

    if (!firstContact || !firstContact.isEnable) {
      return;
    }
    if (!user.phoneSystem) {
      return;
    }
    const phoneNumberOwner = user.phoneSystem[0];
    const from = `+${phoneNumberOwner.code}${phoneNumberOwner.phone}`;
    const { firstTask } = firstContact;
    await this.sendTask(context, from, to, firstTask);

    this.backgroudJobService.job(
      now(1800000), // 30 minutes
      undefined,
      this.handleReminderTask(context, user, from, to),
    );
  }

  private handleReminderTask(
    context: RequestContext,
    user: UserDocument,
    from: string,
    to: string,
  ) {
    return async () => {
      const firstContact = await this.firstContactDocument
        .findOne({
          createdBy: user.id,
        })
        .populate(['firstTask', 'reminderTask']);
      if (!firstContact || !firstContact.isEnable || !firstContact.reminderTask) {
        this.logger.log(`Skip reminder task for ${to}`);
        return;
      }
      const subscribers = await this.formSubmissionFindByPhoneNumberAction.execute(
        context,
        convertStringToPhoneNumber(to),
        user.id,
      );
      if (subscribers.length !== 0) {
        this.logger.log(`Skip reminder task for ${to}`);
      }
      this.logger.log(`Send reminder task for ${to}`);
      await this.sendTask(context, from, to, firstContact.reminderTask);
    };
  }

  private async sendTask(context: RequestContext, from: string, to: string, task: TaskDocument) {
    this.logger.debug(`task: ${JSON.stringify(task)}`);
    if (!task) {
      return;
    }

    await this.smsService.sendMessage(
      context,
      from,
      task.message || '',
      task.fileAttached,
      to,
      undefined,
      this.saveSms(context, from, to, task),
    );
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
