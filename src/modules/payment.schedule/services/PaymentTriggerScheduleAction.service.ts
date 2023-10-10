/* eslint-disable import/order */
/* eslint-disable unicorn/consistent-destructuring */
/* eslint-disable no-await-in-loop */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as schedule from 'node-schedule';

import { ConfigService } from 'src/configs/config.service';
import {
  PLAN_PAYMENT_METHOD,
  PLAN_SUBSCRIPTION_STATUS,
} from '../../plan-subscription/plan-subscription.constant';
import { PlanSubscriptionGetByUserIdAction } from '../../plan-subscription/services/plan-subscription-get-by-user-id-action.service';
import { IPrice } from '../../subscription/interfaces/IGetPriceByItems';
import { PaymentScheduleFindAction } from './PaymentScheduleFindAction.service';

import { Cron, CronExpression } from '@nestjs/schedule';
import { rootLogger } from '../../../utils/Logger';
import { RequestContext } from '../../../utils/RequestContext';
import { PlanSubscriptionCreateAction } from '../../plan-subscription/services/plan-subscription-create-action.service';
import { SubscriptionCreateTriggerPaymentAction } from '../../subscription/services/SubscriptionCreateTriggerPaymentAction.service';
import { UserFindByIdAction } from '../../user/services/UserFindByIdAction.service';
import moment from 'moment';

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
          console.log('CRON Job user', user);
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
              a2pApprovalDate: new Date(),
            });
          }
          const {
            price: priceCharged,
            priceId,
            productName,
            registrationDate,
            planPaymentMethod,
            a2pApprovalDate,
          } = planSubscription;

          // if (!a2pApprovalDate) {
          if (!registrationDate) {
            context.logger.info(
              `Monthly CRON Task: a2pApprovalDate is null for ${context.user.id}`,
            );
            continue;
          }
          const price: IPrice = {
            price: priceCharged || this.configService.priceStarterPlane,
            priceId: priceId || '',
            productName: productName || 'Starter',
          };
          // const createAt =
          //   planSubscription.planPaymentMethod === PLAN_PAYMENT_METHOD.MONTHLY
          //     ? registrationDate
          //     : moment(registrationDate).set('year', new Date().getFullYear()).toDate();
          // const createAt = a2pApprovalDate;
          const createAt = registrationDate;
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
          this.logger.log(`Successfully created schedule for ${context.user.id}!`);
        } catch (error) {
          this.logger.error(error);
          this.logger.debug(`Skip schedule of user ${context.user.id}`);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  handleCron() {
    this.logger.debug('Triggers cron every day!');
    this.triggerSchedule();
  }
}
