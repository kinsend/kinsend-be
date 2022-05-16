import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../configs/config.service';
import { IllegalStateException } from '../../../utils/exceptions/IllegalStateException';
import { RequestContext } from '../../../utils/RequestContext';
import { UserResponseDto } from '../../user/dtos/UserResponse.dto';
import { USER_PROVIDER } from '../../user/interfaces/user.interface';

@Injectable()
export class AuthSigninByGoogleAction {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async execute(context: RequestContext, idToken: string): Promise<UserResponseDto> {
    const { logger, correlationId } = context;
    try {
      const response = await this.httpService
        .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`)
        .toPromise();
      if (!response) {
        throw new IllegalStateException('Request signin by Google is not successful');
      }
      /**
       * @ref https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo
       */
      type SocialUserGoogle = {
        email: string;
        email_verified: string;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        sub: string;
      };
      const socialUserGoogle: SocialUserGoogle = response.data;

      return {
        id: '',
        firstName: socialUserGoogle.given_name,
        lastName: socialUserGoogle.family_name,
        email: socialUserGoogle.email,
        provider: USER_PROVIDER.GOOGLE,
      };
    } catch (error: any) {
      const message = 'Exception request by Google token';
      logger.error({
        correlationId,
        msg: message,
        error,
      });
      throw new IllegalStateException(message);
    }
  }
}
