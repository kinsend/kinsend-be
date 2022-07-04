/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { BackgroudJobService } from '../../../../shared/services/backgroud.job.service';
import { SmsService } from '../../../../shared/services/sms.service';
import { now } from '../../../../utils/nowDate';
import { RequestContext } from '../../../../utils/RequestContext';
import { FormDocument } from '../../../form/form.schema';
import { Tags } from '../../../tags/tags.schema';
import { PhoneNumber } from '../../../user/dtos/UserResponse.dto';
import { AutomationDocument } from '../../automation.schema';
import { AutomationBaseTriggeAction } from './AutomationBaseTriggerAction.service';

@Injectable()
export class AutomationTriggerContactTaggedAction extends AutomationBaseTriggeAction {
  constructor(private backgroudJobService: BackgroudJobService, private smsService: SmsService) {
    super();
  }

  async execute(
    context: RequestContext,
    form: FormDocument | undefined,
    from: string,
    automation: AutomationDocument,
    subscriberEmail: string,
    subscriberPhoneNumber: PhoneNumber,
  ): Promise<void> {
    const { logger } = context;
    const { taggedTags, id, triggerType } = automation;
    if (!taggedTags || (taggedTags as Tags[]).length === 0) {
      logger.info({
        title: 'Skip trigger CONTACT_TAGGED automation!',
        automationId: id,
        triggerType,
        subscriberPhoneNumber,
        subscriberEmail,
      });

      return;
    }

    if (!form) {
      logger.info({
        title: 'Skip trigger CONTACT_TAGGED automation!',
        automationId: id,
        triggerType,
        subscriberPhoneNumber,
        subscriberEmail,
      });

      return;
    }

    const tags = taggedTags.filter((tag) =>
      tag._id.toString() === form.tags._id.toString() ? tag : undefined,
    );
    if (tags.length === 0) {
      logger.info({
        title: 'Skip trigger CONTACT_TAGGED automation. Tags not match!',
        automationId: id,
        triggerType,
        subscriberPhoneNumber,
        subscriberEmail,
      });
      return;
    }

    logger.info('\n*******************************************\n');
    logger.info({
      title: 'Start trigger CONTACT_CREATED automation',
      automationId: id,
      triggerType,
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
      automationId: id,
      triggerType,
      subscriberPhoneNumber,
      subscriberEmail,
    });
  }
}
