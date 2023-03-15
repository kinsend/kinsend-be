import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../configs/config.service';
import { hashAndValidatePassword, verify } from '../../../utils/hashUser';
import { UserPasswordUpdatePayload } from '../dtos/UserUpdatePasswordPayload.dto';
import { UserFindByIdAction } from './UserFindByIdAction.service';
import { UserUpdatePasswordResponse } from '../dtos/UserUpdatePasswordResponse.dto';
import { RequestContext } from '../../../utils/RequestContext';
import { UnauthorizedException } from '../../../utils/exceptions/UnauthorizedException';
import { AuthAccessTokenResponseDto } from '../../auth/dtos/AuthTokenResponseDto';
import { PlanSubscriptionGetByUserIdAction } from '../../plan-subscription/services/plan-subscription-get-by-user-id-action.service';

@Injectable()
export class UserUpdatePasswordAction {
  constructor(
    private configService: ConfigService,
    private userFindByIdAction: UserFindByIdAction,
    private jwtService: JwtService,
    private planSubscriptionGetByUserIdAction: PlanSubscriptionGetByUserIdAction,
  ) {}

  async execute(
    context: RequestContext,
    payload: UserPasswordUpdatePayload,
  ): Promise<UserUpdatePasswordResponse> {
    const { oldPassword, newPassword } = payload;
    const { correlationId, user } = context;

    const userInfo = await this.userFindByIdAction.execute(context, user.id);

    const isValidPassword = await verify(oldPassword, userInfo.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { jwtSecret, accessTokenExpiry, saltRounds } = this.configService;
    const hashPass = await hashAndValidatePassword(newPassword, saltRounds);
    await userInfo.update({ password: hashPass, updatedAt: Date.now() });
    const planSubscription = await this.planSubscriptionGetByUserIdAction.execute(userInfo.id);

    const {
      id,
      email,
      phoneNumber,
      firstName,
      lastName,
      stripeCustomerUserId,
      isEnabledBuyPlan,
      isEnabledPayment,
    } = userInfo;
    const payloadAccessToken: AuthAccessTokenResponseDto = {
      id,
      email,
      phoneNumber,
      firstName,
      lastName,
      sessionId: correlationId,
      stripeCustomerUserId,
      isEnabledBuyPlan,
      isEnabledPayment,
      planSubscription,
    };

    const accessToken = this.jwtService.sign(payloadAccessToken, {
      secret: jwtSecret,
      expiresIn: accessTokenExpiry,
    });

    const token: UserUpdatePasswordResponse = {
      user: payloadAccessToken,
      accessToken,
    };
    return token;
  }
}
