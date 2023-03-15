/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { RequestContext } from '../../../utils/RequestContext';
import { CNAME, CNAMEDocument } from '../../cname/cname.schema';
import { CNAMEGetByUserIdAction } from '../../cname/services/CNAMEGetByUserIdAction.service';
import {
  PlanSubscription,
  PlanSubscriptionDocument,
} from '../../plan-subscription/plan-subscription.schema';
import { PlanSubscriptionGetByUserIdAction } from '../../plan-subscription/services/plan-subscription-get-by-user-id-action.service';
import { UserProfileResponse } from '../interfaces/user.interface';
import { User, UserDocument } from '../user.schema';
import { UserFindByIdAction } from './UserFindByIdAction.service';

@Injectable()
export class UserGetProfileAction {
  constructor(
    private userFindByIdAction: UserFindByIdAction,
    private cnameGetByUserIdAction: CNAMEGetByUserIdAction,
    private planSubscriptionGetByUserIdAction: PlanSubscriptionGetByUserIdAction,
  ) {}

  async execute(context: RequestContext): Promise<UserProfileResponse> {
    const { user } = context;
    const [userProfile, cname, planSub] = await Promise.all([
      this.userFindByIdAction.execute(context, user.id),
      this.cnameGetByUserIdAction.execute(context, user.id),
      this.planSubscriptionGetByUserIdAction.execute(user.id),
    ]);

    return this.buildResponse(userProfile, cname, planSub);
  }

  private buildResponse(
    userProfile: UserDocument,
    cname: CNAMEDocument | null,
    planSub: PlanSubscriptionDocument | null,
  ): UserProfileResponse {
    const response: UserProfileResponse = plainToClass<User, Object>(User, userProfile.toJSON());
    response.cname = cname ? plainToClass<CNAME, Object>(CNAME, cname.toJSON()) : cname;
    response.planSubscription = planSub
      ? plainToClass<PlanSubscription, Object>(PlanSubscription, planSub.toJSON())
      : planSub;
    return response;
  }
}
