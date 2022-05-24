import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestContext } from 'src/utils/RequestContext';
import { AuthAccessTokenResponseDto } from 'src/modules/auth/dtos/AuthTokenResponseDto';
import { UnauthorizedException } from 'src/utils/exceptions/UnauthorizedException';
import { ConfigService } from '../../../configs/config.service';
import { hashAndValidatePassword, verify } from '../../../utils/hashUser';
import { UserPasswordUpdatePayload } from '../dtos/UserUpdatePasswordPayload.dto';
import { UserFindByIdAction } from './UserFindByIdAction.service';
import { UserUpdatePasswordResponse } from '../dtos/UserUpdatePasswordResponse.dto';

@Injectable()
export class UserUpdatePasswordAction {
  constructor(
    private configService: ConfigService,
    private userFindByIdAction: UserFindByIdAction,
    private jwtService: JwtService,
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
