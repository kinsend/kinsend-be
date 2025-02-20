/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { ConfigService } from './configs/config.service';
import { bootstrapApp } from './utils/bootstrapApp';
import { urlencoded, json } from 'express';
import { rootLogger } from './utils/Logger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  bootstrapApp(app);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const { port, environment, host } = new ConfigService();

  const logMessage = `api server started host: ${host}:${port} `;
  // test deployment
  await (environment === 'production'
    ? app
        .listen(port, () => {
          rootLogger.info({ port }, logMessage);
        })
        .catch((error) => {
          rootLogger.fatal(
            {
              err: error,
              errorStack: error.stack,
            },
            'fail to start server',
          );
          process.exit(1);
        })
    : app.listen(port, () => {
        rootLogger.info({ port }, logMessage);
      }));
}
bootstrap();
