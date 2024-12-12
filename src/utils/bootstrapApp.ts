/* eslint-disable unicorn/prefer-module */
import 'source-map-support/register';
import helmet, { contentSecurityPolicy } from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { ErrorRespTransformInterceptor } from './interceptors/ErrorRespTransformInterceptor';
import { ConfigService } from '../configs/config.service';

export async function bootstrapApp(app: NestExpressApplication) {
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
    .setTitle('Kinsend Backend API')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  app.use(helmet());
  app.useGlobalInterceptors(new ErrorRespTransformInterceptor());
}
