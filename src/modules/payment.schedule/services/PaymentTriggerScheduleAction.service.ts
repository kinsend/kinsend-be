import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as schedule from 'node-schedule';
import { SubscriptionCreateTriggerPaymentAction } from 'src/modules/subscription/services/SubscriptionCreateTriggerPaymentAction.service';
import { RequestContext } from 'src/utils/RequestContext';
import { rootLogger } from 'src/utils/Logger';
import { UserFindByIdAction } from 'src/modules/user/services/UserFindByIdAction.service';
import { PaymentScheduleFindAction } from './PaymentScheduleFindAction.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from 'src/configs/config.service';

@Injectable()
export class PaymentTriggerScheduleAction implements OnModuleInit {
  private logger = new Logger();

  constructor(
    private configService: ConfigService,
    private paymentScheduleFindAction: PaymentScheduleFindAction,
    private userFindByIdAction: UserFindByIdAction,
    private subscriptionCreateTriggerPaymentAction: SubscriptionCreateTriggerPaymentAction,
  ) {}

  onModuleInit() {
    // this.triggerSchedule();
  }

  async triggerSchedule() {
    this.logger.debug('Running schedule');
    const paymentSchedules = await this.paymentScheduleFindAction.execute();
    const context: RequestContext = {
      logger: rootLogger,
      correlationId: '',
      user: {},
    };
    for (const paymentSchedule of paymentSchedules) {
      const { productName, scheduleName, datetime, customerId, userId } = paymentSchedule;
      const userIdSchedule = userId as unknown as string;
      const myJob = await schedule.scheduledJobs[scheduleName];
      if (!myJob) {
        try {
          context.user.id = userIdSchedule;
          const user = await this.userFindByIdAction.execute(context, userIdSchedule);
          await this.subscriptionCreateTriggerPaymentAction.execute(
            context,
            user,
            customerId,
            paymentSchedule.pricePlan || this.configService.priceStarterPlane,
            datetime,
            scheduleName,
            productName || 'Starter',
            false,
          );
          this.logger.debug(`Create schedule for ${context.user.id} successfull!`, {
            pricePlan: paymentSchedule.pricePlan || this.configService.priceStarterPlane,
            datetime,
            productName: productName || 'Starter',
            userId: user.id,
          });
        } catch (error) {
          this.logger.error(error);
          this.logger.debug(`Skipp schedule of user ${context.user.id}`);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  handleCron() {
    this.logger.debug('Trigger scron everyday!');
    this.triggerSchedule();
  }
}
