import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { VerificationModule } from './modules/verification/verification.module';
import { LoggerMiddleware } from './utils/middlewares/Logger.middleware';
import { PaymentModule } from './modules/payment/payment.module';
import { ResourceModule } from './modules/resource/resource.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { VCardModule } from './modules/vcard/vcard.module';
import { CustomFieldsModule } from './modules/custom.fields/custom.fields.module';

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    VerificationModule,
    PaymentModule,
    ResourceModule,
    SubscriptionModule,
    VCardModule,
    CustomFieldsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
