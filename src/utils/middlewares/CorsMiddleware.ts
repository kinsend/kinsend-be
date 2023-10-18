import { NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { ConfigService } from 'src/configs/config.service';
import * as cors from 'cors';

export class CORSMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    console.log('Using CORS');
    const { corsEnabled, corsAllowedOrigins } = new ConfigService();
    const corsConfig = corsEnabled
      ? {
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
          allowedHeaders: [
            'Authorization',
            'RefreshToken',
            'Content-Type',
            'Accept',
            'Origin',
            'Referer',
            'User-Agent',
            'Authorization',
            'X-Money-Bag-Signature',
            'X-Api-Key',
            'x-request-id',
          ],
          exposedHeaders: [
            'Authorization',
            'RefreshToken',
            'X-Api-Key',
            'AccessToken',
            'X-KinSend-Signature',
          ],
          credentials: true,
          origin: corsAllowedOrigins || '*',
        }
      : false;
    return corsConfig ? cors(corsConfig)(request, response, next) : next();
  }
}
