import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthValidateAction } from '../../modules/auth/services/AuthValidateAction.service';
import { UserResponseDto } from '../../modules/user/dtos/UserResponse.dto';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy, 'passport-local') {
  constructor(private readonly authValidateAction: AuthValidateAction) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserResponseDto> {
    return this.authValidateAction.execute(email, password);
  }
}
