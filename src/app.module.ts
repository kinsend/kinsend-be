import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { VerificationModule } from './modules/verification/verification.module';

@Module({
  imports: [SharedModule, UserModule, AuthModule, VerificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
