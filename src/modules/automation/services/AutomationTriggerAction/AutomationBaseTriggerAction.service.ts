/* eslint-disable no-await-in-loop */
import { SmsService } from '../../../../shared/services/sms.service';
import { RequestContext } from '../../../../utils/RequestContext';
import { sleep } from '../../../../utils/sleep';
import { PhoneNumber } from '../../../user/dtos/UserResponse.dto';
import { AutomationDocument } from '../../automation.schema';
import { Delay } from '../../dtos/AutomationCreatePayload.dto';
import { AutomationBaseTriggerAction } from '../../interfaces/automation.interface';
import { DURATION } from '../../interfaces/const';

export class AutomationBaseTriggeAction implements AutomationBaseTriggerAction {
  public handleCaculateDatetimeDelay(startTimeTrigger: Date, delay: Delay): number {
    switch (delay.duration) {
      case DURATION.TIME_FROM_TRIGGER: {
        const { days, hours, minutes, seconds } = delay;
        const dateTimeDelayMiliSeconds =
          ((((days || 0) * 24 + (hours || 0)) * 60 + (minutes || 0)) * 60 + (seconds || 0)) * 1000;
        const dateTimeExpected = new Date(startTimeTrigger.getTime() + dateTimeDelayMiliSeconds);
        return dateTimeExpected.getTime() - Date.now();
      }
      default:
        return new Date(delay.datetime as Date).getTime() - Date.now();
    }
  }

  public excuteTasks(
    context: RequestContext,
    smsService: SmsService,
    startTimeTrigger: Date,
    automation: AutomationDocument,
    subscriberPhoneNumber: PhoneNumber,
  ) {
    const { logger } = context;
    const to = `+${subscriberPhoneNumber.code}${subscriberPhoneNumber.phone}`;
    return async () => {
      logger.info('Excuting task');
      for (const task of automation.tasks) {
        if (task.delay) {
          const delayDatetime = this.handleCaculateDatetimeDelay(startTimeTrigger, task.delay);
          if (delayDatetime > 0) {
            console.log('\n*******************************************\n');
            logger.info(`Being delayed to ${delayDatetime} ms`);
            await sleep(delayDatetime);
            console.log('\n*******************************************\n');
            logger.info('delayed');
          }
        } else {
          console.log('\n*******************************************\n');
          logger.info({
            description: 'Sending task message to subscriber',
            message: task.message,
            subscriberPhoneNumber,
            triggerType: automation.triggerType,
          });
          await smsService.sendMessage(context, task.message || '', task.fileAttached, to);
        }
      }
    };
  }
}
