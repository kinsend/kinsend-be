import 'source-map-support/register';
import helmet from 'helmet';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorRespTransformInterceptor } from './interceptors/ErrorRespTransformInterceptor';
import { ConfigService } from '../configs/config.service';

export async function bootstrapApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API key for external calls',
      },
      'x-api-key',
    )
    .addBearerAuth()
    .setTitle('NextJS TypeScript Test Assignment')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('NextJS TypeScript Test Assignment')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(helmet());
  const { corsEnabled, corsAllowedOrigins } = new ConfigService();
  const cors = corsEnabled
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
        origin(origin: string, callback: (error: Error | null, success?: true) => void) {
          if (corsAllowedOrigins === 'all') {
            callback(null, true);
            return;
          }
          if (corsAllowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error(`Origin[${origin}] not allowed by CORS`));
          }
        },
      }
    : {};
  app.enableCors(cors);
  app.useGlobalInterceptors(new ErrorRespTransformInterceptor());
}
