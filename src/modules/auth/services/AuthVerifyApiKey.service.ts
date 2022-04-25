import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { ConfigService } from '../../../configs/config.service';
import { UnauthorizedException } from '../../../utils/exceptions/UnauthorizedException';

@Injectable()
export class AuthVerifyApiKey implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [request] = context.getArgs();
    const xApiKey = request.headers['x-api-key'];
    if (!xApiKey) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { apiKey } = this.configService;
    if (xApiKey !== apiKey) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
