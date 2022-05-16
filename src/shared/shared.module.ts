import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/configs/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { MongodbConfigService } from '../configs/mongodb.config.service';
import { MailModule } from '../modules/mail/mail.module';
import { SmsService } from './services/sms.service';
import { StripeService } from './services/stripe.service';
import { AwsS3Service } from './services/AwsS3Service';
import { MulterModule } from '@nestjs/platform-express';

const configService = new ConfigService();
const { jwtSecret, accessTokenExpiry } = configService;
@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongodbConfigService,
    }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: accessTokenExpiry },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MailModule,
    HttpModule.register({}),
  ],
  exports: [
    ConfigService,
    SmsService,
    StripeService,
    JwtModule,
    MailModule,
    CacheModule,
    HttpModule,
    AwsS3Service,
  ],
  providers: [ConfigService, SmsService, StripeService, HttpModule, AwsS3Service],
})
export class SharedModule {}
