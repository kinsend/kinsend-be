import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthValidateAction } from '../../modules/auth/services/AuthValidateAction.service';
import { UserCreateResponseDto } from '../../modules/user/dtos/UserCreateResponse.dto';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy, 'passport-local') {
  constructor(private readonly authValidateAction: AuthValidateAction) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserCreateResponseDto> {
    return this.authValidateAction.execute(email, password);
  }
}
