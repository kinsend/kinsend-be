import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as schedule from 'node-schedule';

import { PaymentScheduleFindAction } from './PaymentScheduleFindAction.service';
import { ConfigService } from 'src/configs/config.service';
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

  constructor(
    private configService: ConfigService,
    private paymentScheduleFindAction: PaymentScheduleFindAction,
    private userFindByIdAction: UserFindByIdAction,
    private subscriptionCreateTriggerPaymentAction: SubscriptionCreateTriggerPaymentAction,
    private planSubscriptionGetByUserIdAction: PlanSubscriptionGetByUserIdAction,
    private planSubscriptionCreateAction: PlanSubscriptionCreateAction,
  ) {}

  onModuleInit() {
    this.triggerSchedule();
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
      const { scheduleName, userId } = paymentSchedule;
      const userIdSchedule = userId as unknown as string;
      const myJob = await schedule.scheduledJobs[scheduleName];
      if (!myJob) {
        try {
          context.user.id = userIdSchedule;
          const user = await this.userFindByIdAction.execute(context, userIdSchedule);
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
          this.logger.debug(
            `Create schedule for ${context.user.id} successfull!`,
            planSubscription,
          );
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
