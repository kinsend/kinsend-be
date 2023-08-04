import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validationSchema } from './validation';
import appConfig from './app.config';
import awsConfig from './aws.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [appConfig, awsConfig],
      validationSchema,
    }),
  ],
})
export class ConfigModule {}
