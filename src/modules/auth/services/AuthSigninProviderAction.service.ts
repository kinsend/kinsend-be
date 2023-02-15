/* eslint-disable unicorn/prefer-module */
/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable consistent-return */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConfigService } from '../../../configs/config.service';
import { SIGNIN_PROVIDER, STATUS } from '../../../domain/const';
import { BadRequestException } from '../../../utils/exceptions/BadRequestException';
import { NotFoundException } from '../../../utils/exceptions/NotFoundException';
import { RequestContext } from '../../../utils/RequestContext';
import { UserResponseDto } from '../../user/dtos/UserResponse.dto';
import { User, UserDocument } from '../../user/user.schema';
import { AuthSigninProviderPayload } from '../dtos/AuthSigninProviderPayloadDto';
import { AuthSignInResponseDto } from '../dtos/AuthSigninResponseDto';
import { AuthSigninByGoogleAction } from './AuthSigninByGoogleAction.service';
import { AuthAccessTokenResponseDto } from '../dtos/AuthTokenResponseDto';
import { AuthRefreshTokenResponseDto } from '../dtos/AuthRefreshTokenResponseDto';
import { StripeService } from '../../../shared/services/stripe.service';
import { PlanSubscriptionGetByUserIdAction } from '../../plan-subscription/services/plan-subscription-get-by-user-id-action.service';

@Injectable()
export class AuthSigninProviderAction {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private authSigninByGoogleAction: AuthSigninByGoogleAction,
    private stripeService: StripeService,
    private planSubscriptionGetByUserIdAction: PlanSubscriptionGetByUserIdAction,
  ) {}

  async execute(
    context: RequestContext,
    provider: SIGNIN_PROVIDER,
    payload: AuthSigninProviderPayload,
  ): Promise<AuthSignInResponseDto> {
    const userSocial = await (async (): Promise<UserResponseDto> => {
      switch (provider) {
        case SIGNIN_PROVIDER.GOOGLE:
          return this.authSigninByGoogleAction.execute(context, payload.idToken);
        default:
          throw new BadRequestException('Provider should be by Google');
      }
    })();
    const { correlationId } = context;
    if (!userSocial) {
      throw new NotFoundException('User', 'Social signin not successful');
    }
    let checkExistedUser = await this.userModel.findOne({ $or: [{ email: userSocial.email }] });
    if (!checkExistedUser) {
      checkExistedUser = await new this.userModel({
        ...userSocial,
        password: null,
        status: STATUS.INACTIVE,
      }).save();

      const fullName = `${checkExistedUser.firstName} ${checkExistedUser.lastName}`;
      const customerInfo = await this.stripeService.createCustomerUser(
        context,
        fullName,
        userSocial.email,
      );

      await this.userModel.findByIdAndUpdate(checkExistedUser.id, {
        status: STATUS.ACTIVE,
        stripeCustomerUserId: customerInfo.id,
      });
    }
    const planSub = await this.planSubscriptionGetByUserIdAction.execute(checkExistedUser.id);

    const { jwtSecret, accessTokenExpiry } = this.configService;
    const {
      id,
      email,
      phoneNumber,
      firstName,
      lastName,
      stripeCustomerUserId,
      image,
      phoneSystem,
    } = checkExistedUser;

    const payloadAccessToken: AuthAccessTokenResponseDto = {
      id,
      email,
      phoneNumber,
      firstName,
      lastName,
      sessionId: correlationId,
      stripeCustomerUserId,
      image,
      phoneSystem,
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
