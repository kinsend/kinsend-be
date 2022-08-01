/* eslint-disable no-underscore-dangle */
/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable curly */
import { Injectable } from '@nestjs/common';
import { UpdateReportingFindByUpdateIdAction } from '../../../modules/update/services/update.reporting/UpdateReportingFindByUpdateIdAction.service';
import { UpdateReportingUpdateAction } from '../../../modules/update/services/update.reporting/UpdateReportingUpdateAction.service';
import { RequestContext } from '../../../utils/RequestContext';
import { SmsStatusCallbackPayloadDto } from '../dtos/SmsStatusCallbackPayloadDto';
import { STATUS_ACCEPTED_HANDLE } from '../interfaces/sms.interface';

@Injectable()
export class SmsStatusCallbackHookAction {
  constructor(
    private updateReportingUpdateAction: UpdateReportingUpdateAction,
    private updateReportingFindByUpdateIdAction: UpdateReportingFindByUpdateIdAction,
  ) {}

  async execute(
    context: RequestContext,
    updateId: string,
    payload: SmsStatusCallbackPayloadDto,
  ): Promise<void> {
    const { logger } = context;
    try {
      if (!updateId) return;
      const { status } = payload;
      if (!Object.values(STATUS_ACCEPTED_HANDLE).includes(status as any)) return;

      const updateReporting = await this.updateReportingFindByUpdateIdAction.execute(
        context,
        updateId,
      );

      if (status === STATUS_ACCEPTED_HANDLE.DELIVERED) {
        this.updateReportingUpdateAction.execute(context, updateId, {
          deliveredNumbers: updateReporting.deliveredNumbers + 1,
        });
        logger.info({
          message: 'New update delivered reporting',
          updateId,
        });
        return;
      }

      if (
        status === STATUS_ACCEPTED_HANDLE.FAILED ||
        status === STATUS_ACCEPTED_HANDLE.UNDELIVERED
      ) {
        this.updateReportingUpdateAction.execute(context, updateId, {
          bounced: updateReporting.bounced + 1,
        });
        logger.info({
          message: 'New update bounced reporting',
          updateId,
        });
      }
    } catch (error) {
      logger.error({
        message: 'Sms status callback hook error!',
        error,
      });
    }
  }
}
