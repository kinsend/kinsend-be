/* eslint-disable @typescript-eslint/no-empty-interface */
import { SmsService } from '../../../shared/services/sms.service';
import { RequestContext } from '../../../utils/RequestContext';
import { Tags } from '../../tags/tags.schema';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';
import { AutomationDocument } from '../automation.schema';
import { AutomationCreatePayload, Delay } from '../dtos/AutomationCreatePayload.dto';
import { AutomationUpdatePayload } from '../dtos/AutomationUpdatePayload.dto';

interface AutomationUnsaveBase {
  taggedTags?: Tags[];
  stopTaggedTags?: Tags[];
}
export interface AutomationUnsave extends AutomationCreatePayload, AutomationUnsaveBase {}

export interface AutomationUpdateUnsave extends AutomationUpdatePayload, AutomationUnsaveBase {}

export abstract class AutomationBaseTriggerAction {
  public abstract handleCaculateDatetimeDelay(startTimeTrigger: Date, delay: Delay): number;
  public abstract excuteTasks(
    context: RequestContext,
    smsService: SmsService,
    startTimeTrigger: Date,
    automation: AutomationDocument,
    subscriberPhoneNumber: PhoneNumber,
  );
}
