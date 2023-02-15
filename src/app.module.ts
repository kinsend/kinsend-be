import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
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
import { VirtualCardModule } from './modules/virtualcard/virtual.card.module';
import { TagsModule } from './modules/tags/tags.module';
import { ImageModule } from './modules/image/image.module';
import { CustomFieldsModule } from './modules/custom.fields/custom.fields.module';
import { FormModule } from './modules/form/form.module';
import { FormSubmissionModule } from './modules/form.submission/form.submission.module';
import { CNAMEModule } from './modules/cname/cname.module';
import { AutomationModule } from './modules/automation/automation.module';
import { SmsHookModule } from './hooks/sms/sms.hook.module';
import { SmsLogModel } from './modules/sms.log/sms.log.module';
import { SegmentModule } from './modules/segment/segment.module';
import { UpdateModule } from './modules/update/update.module';
import { RedirectModule } from './modules/redirect/redirect.module';
import { MessageModule } from './modules/messages/message.module';
import { SmsModel } from './modules/sms/sms.module';
import { HistoryImportContactModule } from './modules/contacts/contact.module';
import { FirstContactModule } from './modules/first-contact/first-contact.module';
import { KeywordResponseModule } from './modules/keyword-response/keyword-response.module';
import { PlanSubscriptionModule } from './modules/plan-subscription/plan-subscription.module';

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    VerificationModule,
    PaymentModule,
    ResourceModule,
    SubscriptionModule,
    VirtualCardModule,
    TagsModule,
    ImageModule,
    CustomFieldsModule,
    FormModule,
    FormSubmissionModule,
    CNAMEModule,
    AutomationModule,
    SmsHookModule,
    SmsLogModel,
    SegmentModule,
    UpdateModule,
    RedirectModule,
    MessageModule,
    SmsModel,
    ScheduleModule.forRoot(),
    HistoryImportContactModule,
    FirstContactModule,
    KeywordResponseModule,
    PlanSubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
