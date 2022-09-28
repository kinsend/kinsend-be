import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { ConfigService } from '../../../configs/config.service';
import { AppRequest } from '../../../utils/AppRequest';
import { tokenCacheKey } from '../../../utils/cacheKeys';
import { UnauthorizedException } from '../../../utils/exceptions/UnauthorizedException';

@Injectable()
export class AuthBlackListTokenAction {
  constructor(
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async execute(context: AppRequest): Promise<void> {
    const { authorization } = context.headers;
    const token = authorization?.split(' ')[1];
    try {
      const jwtToken = this.jwtService.verify(token || '');
      const { sessionId, id } = jwtToken;
      const cacheKey = tokenCacheKey(`${sessionId}-${id}`);
      const hasCache = await this.cacheManager.get(cacheKey);
      const { timeToLive } = this.configService;
      if (!hasCache) {
        await this.cacheManager.set(cacheKey, jwtToken, timeToLive);
        return;
      }
      throw new UnauthorizedException(`Expired session : ${sessionId}`);
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Unauthorized');
    }
  }
}
