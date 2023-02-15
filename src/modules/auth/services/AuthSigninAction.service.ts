import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlanSubscriptionGetByUserIdAction } from 'src/modules/plan-subscription/services/plan-subscription-get-by-user-id-action.service';
import { ConfigService } from '../../../configs/config.service';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { UserDocument } from '../../user/user.schema';
import { AuthRefreshTokenResponseDto } from '../dtos/AuthRefreshTokenResponseDto';
import { AuthSignInResponseDto } from '../dtos/AuthSigninResponseDto';
import { AuthAccessTokenResponseDto } from '../dtos/AuthTokenResponseDto';

@Injectable()
export class AuthSignInAction {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private planSubscriptionGetByUserIdAction: PlanSubscriptionGetByUserIdAction,
  ) {}

  async execute(context: RequestContext): Promise<AuthSignInResponseDto> {
    const { correlationId, user } = context;
    const {
      id,
      email,
      phoneNumber,
      firstName,
      lastName,
      stripeCustomerUserId,
      isEnabledBuyPlan,
      isEnabledPayment,
      image,
      phoneSystem,
      priceSubscribe,
    } = <UserDocument>user;
    if (!user) {
      throw new NotFoundException('User', 'Username and password are not correct');
    }
    const planSub = await this.planSubscriptionGetByUserIdAction.execute(id);
    const { jwtSecret, accessTokenExpiry } = this.configService;
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
      image,
      phoneSystem,
      priceSubscribe,
      planSub,
    };

    const accessToken = this.jwtService.sign(payloadAccessToken, {
      secret: jwtSecret,
      expiresIn: accessTokenExpiry,
    });

    const payloadRefreshToken: AuthRefreshTokenResponseDto = {
      id: payloadAccessToken.id,
      sessionId: correlationId,
    };

    const refreshToken = this.jwtService.sign(payloadRefreshToken, {
      secret: jwtSecret,
      expiresIn: accessTokenExpiry,
    });

    const token: AuthSignInResponseDto = {
      user: payloadAccessToken,
      accessToken,
      refreshToken,
    };
    return token;
  }
}
