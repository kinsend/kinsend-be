import { Injectable } from '@nestjs/common';
import { AutomationCreateTriggerAutomationAction } from '../../../modules/automation/services/AutomationCreateTriggerAutomationAction.service';
import { SmsLogCreateAction } from '../../../modules/sms.log/services/SmsLogCreateAction.service';
import { SmsLogsGetByFromAction } from '../../../modules/sms.log/services/SmsLogsGetByFromAction.service';
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
    ]);
  }

  private async handleTriggerAutomation(context: RequestContext, payload: any) {
    const smsLog = await this.smsLogsGetByFromAction.execute(payload.From);
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
}
