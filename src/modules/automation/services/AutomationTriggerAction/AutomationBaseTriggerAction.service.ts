/* eslint-disable no-await-in-loop */
import * as date from 'date-and-time';
import { SmsService } from '../../../../shared/services/sms.service';
import { Logger } from '../../../../utils/Logger';
import { RequestContext } from '../../../../utils/RequestContext';
import { sleep } from '../../../../utils/sleep';
import { SmsLogsGetByFromAction } from '../../../sms.log/services/SmsLogsGetByFromAction.service';
import { PhoneNumber } from '../../../user/dtos/UserResponse.dto';
import { AutomationDocument } from '../../automation.schema';
import { Delay } from '../../dtos/AutomationCreatePayload.dto';
import { AutomationBaseTriggerAction } from '../../interfaces/automation.interface';
import { DURATION, TRIGGER_TYPE } from '../../interfaces/const';

export class AutomationBaseTriggeAction implements AutomationBaseTriggerAction {
  public handleCaculateDatetimeDelay(startTimeTrigger: Date, delay: Delay): number {
    switch (delay.duration) {
      case DURATION.TIME_FROM_TRIGGER: {
        const { days, hours, minutes, seconds } = delay;
        let dateCaculate = new Date(startTimeTrigger);
        if (hours) {
          dateCaculate = date.addHours(dateCaculate, hours);
        }

        if (days) {
          dateCaculate = date.addDays(dateCaculate, days);
        }

        if (minutes) {
          dateCaculate = date.addMinutes(dateCaculate, minutes);
        }

        if (seconds) {
          dateCaculate = date.addSeconds(dateCaculate, seconds);
        }

        return date.subtract(dateCaculate, new Date()).toMilliseconds();
      }
      case DURATION.UNTIL_DATE: {
        const { datetime } = delay;
        if (!datetime) {
          return 0;
        }

        return date.subtract(new Date(datetime), new Date()).toMilliseconds();
      }
      default:
        return date.subtract(delay.datetime as Date, new Date()).toMilliseconds();
    }
  }

  private async isStopTriggerFirstMessage(
    automation: AutomationDocument,
    smsLogsGetByFromAction: SmsLogsGetByFromAction | undefined,
    subscriberPhoneNumber: string,
  ): Promise<boolean> {
    if (!automation.stopTriggerType || automation.stopTriggerType !== TRIGGER_TYPE.FIRST_MESSAGE) {
      return false;
    }
    if (!smsLogsGetByFromAction) {
      return false;
    }
    const smsLogs = await smsLogsGetByFromAction.execute(subscriberPhoneNumber);
    return smsLogs.length > 1;
  }

  private async excuteDelay(logger: Logger, startTimeTrigger: Date, delay: Delay) {
    const delayDatetime = this.handleCaculateDatetimeDelay(startTimeTrigger, delay);
    if (delayDatetime > 0) {
      console.log('\n*******************************************\n');
      logger.info(`Being delayed to ${delayDatetime} ms`);

      await sleep(delayDatetime);

      console.log('\n*******************************************\n');
      logger.info('delayed');
    }
  }

  public excuteTasks(
    context: RequestContext,
    smsService: SmsService,
    smsLogsGetByFromAction: SmsLogsGetByFromAction | undefined,
    from: string,
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
          await this.excuteDelay(logger, startTimeTrigger, task.delay);
        } else {
          const isStopTriggerFirstMessage = await this.isStopTriggerFirstMessage(
            automation,
            smsLogsGetByFromAction,
            to,
          );
          if (isStopTriggerFirstMessage) {
            logger.info({
              description: 'Stop automation type FirstMessage.',
              message: task.message,
              subscriberPhoneNumber,
              triggerType: automation.triggerType,
              isStopTriggerFirstMessage,
            });
            return;
          }
          console.log('\n*******************************************\n');
          logger.info({
            description: 'Sending task message to subscriber',
            message: task.message,
            subscriberPhoneNumber,
            triggerType: automation.triggerType,
          });
          await smsService.sendMessage(context, from, task.message || '', task.fileAttached, to);
        }
      }
    };
  }
}
