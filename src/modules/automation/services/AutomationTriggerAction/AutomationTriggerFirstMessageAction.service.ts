/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { now } from '../../../../utils/nowDate';
import { RequestContext } from '../../../../utils/RequestContext';
import { SmsLogsGetByFromAction } from '../../../sms.log/services/SmsLogsGetByFromAction.service';
import { PhoneNumber } from '../../../user/dtos/UserResponse.dto';
import { AutomationDocument } from '../../automation.schema';
import { AutomationBaseTriggeAction } from './AutomationBaseTriggerAction.service';

@Injectable()
export class AutomationTriggerFirstMessageAction extends AutomationBaseTriggeAction {
  constructor(
    private backgroudJobService: BackgroudJobService,
    private smsService: SmsService,
    private smsLogsGetByFromAction: SmsLogsGetByFromAction,
  ) {
    super();
  }

  async execute(
    context: RequestContext,
    from: string,
    automation: AutomationDocument,
    subscriberEmail: string | undefined,
    subscriberPhoneNumber: PhoneNumber,
  ): Promise<void> {
    const { logger } = context;
    logger.info('\n*******************************************\n');
    logger.info({
      title: 'Start trigger FIRST_MESSAGE automation',
      automationId: automation.id,
      triggerType: automation.triggerType,
      subscriberPhoneNumber,
      subscriberEmail,
    });

    const startTimeTrigger = now(3000);
    this.backgroudJobService.job(
      startTimeTrigger,
      undefined,
      this.excuteTasks(
        context,
        this.smsService,
        this.smsLogsGetByFromAction,
        from,
        startTimeTrigger,
        automation,
        subscriberPhoneNumber,
      ),
    );

    logger.info('\n*******************************************\n');
    logger.info({
      title: 'Finish create job trigger FIRST_MESSAGE automation',
      automationId: automation.id,
      triggerType: automation.triggerType,
      subscriberPhoneNumber,
      subscriberEmail,
    });
  }
}
