import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/configs/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbConfigService } from '../configs/mongodb.config.service';

const configService = new ConfigService();
const { jwtSecret, accessTokenExpiry } = configService;
@Module({
  imports: [
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
  ],
  exports: [ConfigService, JwtModule],
  providers: [ConfigService],
})
export class SharedModule {}
