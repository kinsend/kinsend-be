/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from './configs/config.service';
import { bootstrapApp } from './utils/bootstrapApp';
import { rootLogger } from './utils/Logger';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  bootstrapApp(app);
  const { port, environment, host } = new ConfigService();

  const logMessage = `api server started host: ${host}:${port} `;
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
