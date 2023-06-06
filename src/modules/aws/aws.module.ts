import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'AWS',
      useFactory: (configService: ConfigService) => {
        AWS.config.update({
          region: configService.get('aws.region'),
          accessKeyId: configService.get('aws.accessKeyId'),
          secretAccessKey: configService.get('aws.secretAccessKey'),
        });
        return AWS;
      },
      inject: [ConfigService],
    },
  ],
})
export class AWSModule {}
