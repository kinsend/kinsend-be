import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../configs/config.service';
import { hashAndValidatePassword } from '../../../utils/hashUser';
import { UserFindByIdAction } from './UserFindByIdAction.service';
import { UserUpdatePasswordResponse } from '../dtos/UserUpdatePasswordResponse.dto';
import { RequestContext } from '../../../utils/RequestContext';
import { AuthAccessTokenResponseDto } from '../../auth/dtos/AuthTokenResponseDto';
import { UserVerifyResetPassword } from '../dtos/UserResetPassword.dto';
import { VerificationConfirmEmailQueryDto } from '../../verification/dtos/VerificationConfirmEmailQuery.dto';
import { UserConfirmationTokenDto } from '../dtos/UserConfirmationToken.dto';

@Injectable()
export class UserVerifyResetPasswordAction {
  constructor(
    private configService: ConfigService,
    private userFindByIdAction: UserFindByIdAction,
    private jwtService: JwtService,
  ) {}

  async execute(
    context: RequestContext,
    query: VerificationConfirmEmailQueryDto,
    payload: UserVerifyResetPassword,
  ): Promise<UserUpdatePasswordResponse> {
    const { newPassword } = payload;
    const { correlationId } = context;
    const decodedJwtEmailToken = this.jwtService.decode(query.token);
    const userDecoded = <UserConfirmationTokenDto>decodedJwtEmailToken;
    const userInfo = await this.userFindByIdAction.execute(context, userDecoded.id);
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
