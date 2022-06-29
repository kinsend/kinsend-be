/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { now } from '../../../../utils/nowDate';
import { RequestContext } from '../../../../utils/RequestContext';
import { PhoneNumber } from '../../../user/dtos/UserResponse.dto';
import { AutomationDocument } from '../../automation.schema';
import { AutomationBaseTriggeAction } from './AutomationBaseTriggerAction.service';

@Injectable()
export class AutomationTriggerFirstMessageAction extends AutomationBaseTriggeAction {
  constructor(private backgroudJobService: BackgroudJobService, private smsService: SmsService) {
    super();
  }

  async execute(
    context: RequestContext,
    automation: AutomationDocument,
    subscriberEmail: string,
    subscriberPhoneNumber: PhoneNumber,
  ): Promise<void> {
    const { logger } = context;
    console.log('\n*******************************************\n');
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
        startTimeTrigger,
        automation,
        subscriberPhoneNumber,
      ),
    );

    console.log('\n*******************************************\n');
    logger.info({
      title: 'Finish trigger FIRST_MESSAGE automation',
      automationId: automation.id,
      triggerType: automation.triggerType,
      subscriberPhoneNumber,
      subscriberEmail,
    });
  }
}
