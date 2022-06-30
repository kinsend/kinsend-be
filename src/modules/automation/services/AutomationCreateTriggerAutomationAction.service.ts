/* eslint-disable unicorn/no-array-for-each */
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../../../utils/RequestContext';
import { FormDocument } from '../../form/form.schema';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { UserDocument } from '../../user/user.schema';
import { AutomationDocument } from '../automation.schema';
import { AUTOMATION_STATUS, TRIGGER_TYPE } from '../interfaces/const';
import { AutomationsGetAction } from './AutomationsGetAction.service';
import { AutomationTriggerContactCreatedAction } from './AutomationTriggerAction/AutomationTriggerContactCreatedAction.service';
import { AutomationTriggerContactTaggedAction } from './AutomationTriggerAction/AutomationTriggerContactTaggedAction.service';

@Injectable()
export class AutomationCreateTriggerAutomationAction {
  constructor(
    private automationsGetAction: AutomationsGetAction,
    private automationTriggerContactCreatedAction: AutomationTriggerContactCreatedAction,
    private automationTriggerContactTaggedAction: AutomationTriggerContactTaggedAction,
  ) {}

  async execute(
    context: RequestContext,
    owner: UserDocument,
    form: FormDocument,
    subscriberEmail: string,
    subscriberPhoneNumber: PhoneNumber,
  ): Promise<void> {
    const automations = await this.automationsGetAction.execute(context, owner.id);
    if (automations.length === 0) {
      return;
    }
    await this.handleTriggerAutomation(
      context,
      form,
      automations,
      subscriberEmail,
      subscriberPhoneNumber,
    );
  }

  async handleTriggerAutomation(
    context: RequestContext,
    form: FormDocument,
    automations: AutomationDocument[],
    subscriberEmail: string,
    subscriberPhoneNumber: PhoneNumber,
  ) {
    automations.forEach(async (automation) => {
      if (automation.status === AUTOMATION_STATUS.DISABLE) {
        return;
      }

      switch (automation.triggerType) {
        case TRIGGER_TYPE.CONTACT_CREATED: {
          this.automationTriggerContactCreatedAction.execute(
            context,
            automation,
            subscriberEmail,
            subscriberPhoneNumber,
          );
          break;
        }
        case TRIGGER_TYPE.CONTACT_TAGGED: {
          this.automationTriggerContactTaggedAction.execute(
            context,
            form,
            automation,
            subscriberEmail,
            subscriberPhoneNumber,
          );
          break;
        }

        default: {
          break;
        }
      }
    });
  }
}
