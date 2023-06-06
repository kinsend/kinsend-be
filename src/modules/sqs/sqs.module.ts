import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';
import { AWSModule } from '../aws/aws.module';

@Module({
  imports: [
    AWSModule,
    ConfigModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        producers: [
          {
            name: `${configService.get<string>('aws.sqsName')}`,
            queueUrl: `${configService.get<string>('aws.sqsUri')}`,
            region: `${configService.get<string>('aws.region')}`,
          },
        ],
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class SQSModule {}
