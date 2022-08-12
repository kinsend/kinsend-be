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
export class AutomationTriggerContactCreatedAction extends AutomationBaseTriggeAction {
  constructor(private backgroudJobService: BackgroudJobService, private smsService: SmsService) {
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
      title: 'Start trigger CONTACT_CREATED automation',
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
        undefined,
        from,
        startTimeTrigger,
        automation,
        subscriberPhoneNumber,
      ),
    );

    logger.info('\n*******************************************\n');
    logger.info({
      title: 'Finish trigger CONTACT_CREATED automation',
      automationId: automation.id,
      triggerType: automation.triggerType,
      subscriberPhoneNumber,
      subscriberEmail,
    });
  }
}
