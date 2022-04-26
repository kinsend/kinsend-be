import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/configs/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbConfigService } from '../configs/mongodb.config.service';
import { MailModule } from '../modules/mail/mail.module';
import { SmsService } from './services/sms.service';

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
  ],
  exports: [ConfigService, SmsService, JwtModule, MailModule, CacheModule],
  providers: [ConfigService, SmsService],
})
export class SharedModule {}
