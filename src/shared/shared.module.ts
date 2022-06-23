import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { MongodbConfigService } from '../configs/mongodb.config.service';
import { MailModule } from '../modules/mail/mail.module';
import { SmsService } from './services/sms.service';
import { StripeService } from './services/stripe.service';
import { VirtualCardService } from './services/virtual.card.service';
import { S3Service } from './services/s3.service';
import { ConfigService } from '../configs/config.service';
import { AmplifyClientService } from './services/ amplify.client.service';
import { ValidateDomainService } from './services/validate.domain.service';

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
    S3Service,
    VirtualCardService,
    AmplifyClientService,
    ValidateDomainService,
  ],
  providers: [
    ConfigService,
    SmsService,
    StripeService,
    HttpModule,
    S3Service,
    VirtualCardService,
    AmplifyClientService,
    ValidateDomainService,
  ],
})
export class SharedModule {}
