import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as schedule from 'node-schedule';

import { PaymentScheduleFindAction } from './PaymentScheduleFindAction.service';
import { ConfigService } from '@app/configs/config.service';
import { IPrice } from '../../subscription/interfaces/IGetPriceByItems';
import { PlanSubscriptionGetByUserIdAction } from '../../plan-subscription/services/plan-subscription-get-by-user-id-action.service';
import {
  PLAN_PAYMENT_METHOD,
  PLAN_SUBSCRIPTION_STATUS,
} from '../../plan-subscription/plan-subscription.constant';
import * as moment from 'moment';

import { PlanSubscriptionCreateAction } from '../../plan-subscription/services/plan-subscription-create-action.service';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import { SubscriptionCreateTriggerPaymentAction } from '../../subscription/services/SubscriptionCreateTriggerPaymentAction.service';
import { RequestContext } from '../../../utils/RequestContext';
import { rootLogger } from '../../../utils/Logger';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PaymentTriggerScheduleAction implements OnModuleInit {

  private logger = new Logger();
  public static CRON_EXPRESSION = CronExpression.EVERY_DAY_AT_1AM;

  constructor(
    private configService: ConfigService,
    private paymentScheduleFindAction: PaymentScheduleFindAction,
    private userFindByIdAction: UserFindByIdAction,
    private subscriptionCreateTriggerPaymentAction: SubscriptionCreateTriggerPaymentAction,
    private planSubscriptionGetByUserIdAction: PlanSubscriptionGetByUserIdAction,
    private planSubscriptionCreateAction: PlanSubscriptionCreateAction,
  ) {}

  onModuleInit() {
    this.schedulePaymentTasks();
  }

  async schedulePaymentTasks() {
    this.logger.log('Running Payment Schedule');
    const paymentSchedules = await this.paymentScheduleFindAction.execute();
    const context: RequestContext = {
      logger: rootLogger,
      correlationId: '',
      user: {},
    };
    for (const paymentSchedule of paymentSchedules) {
      const { scheduleName, userId } = paymentSchedule;
      const userIdSchedule = userId as unknown as string;
      const myJob = await schedule.scheduledJobs[scheduleName];
      if (!myJob) {
        try {
          context.user.id = userIdSchedule;
          const user = await this.userFindByIdAction.execute(context, userIdSchedule);
          this.logger.log(' job for user', user);
          let planSubscription = await this.planSubscriptionGetByUserIdAction.execute(
            userIdSchedule,
          );
          if (!planSubscription) {
            planSubscription = await this.planSubscriptionCreateAction.execute(context, {
              planPaymentMethod: PLAN_PAYMENT_METHOD.MONTHLY,
              priceId: user.priceSubscribe || '',
              status: PLAN_SUBSCRIPTION_STATUS.ACTIVE,
              userId: userIdSchedule,
              registrationDate: new Date(),
            });
          }
          const {
            price: priceCharged,
            priceId,
            productName,
            registrationDate,
            planPaymentMethod,
          } = planSubscription;
          const price: IPrice = {
            price: priceCharged || this.configService.priceStarterPlane,
            priceId: priceId || '',
            productName: productName || 'Starter',
          };
          const createAt =
            planSubscription.planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
              ? registrationDate
              : moment(registrationDate).set('year', new Date().getFullYear()).toDate();
          await this.subscriptionCreateTriggerPaymentAction.execute(
            context,
            user,
            price,
            priceCharged,
            createAt,
            scheduleName,
            planPaymentMethod,
            false,
          );
          this.logger.log(`Payment task scheduled for user ${context.user.id}.`);
        } catch (error) {
          this.logger.error({ err: error, errStack: error.stack }, `Exception: Payment task skipped for user ${context.user.id}!`);
        }
      }
    }
  }

  @Cron(PaymentTriggerScheduleAction.CRON_EXPRESSION)
  handleCron() {
    this.logger.log('Payment cron tasks are scheduled with cron expression: ' + PaymentTriggerScheduleAction.CRON_EXPRESSION);
    this.schedulePaymentTasks();
  }
}
