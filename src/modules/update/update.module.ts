import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { FormModule } from '../form/form.module';
import { MessageModule } from '../messages/message.module';
import { PaymentMonthlyModule } from '../payment.monthly/payment.monthly.module';
import { PaymentModule } from '../payment/payment.module';
import { SegmentModule } from '../segment/segment.module';
import { TagsModule } from '../tags/tags.module';
import { UserModule } from '../user/user.module';
import { LinkRedirect, LinkRedirectSchema } from './link.redirect.schema';
import { LinkRediectCreateAction } from './services/link.redirect/LinkRediectCreateAction.service';
import { LinkRediectCreateByMessageAction } from './services/link.redirect/LinkRediectCreateByMessageAction.service';
import { LinkRedirectClickedAction } from './services/link.redirect/LinkRedirectClickedAction.service';
import { LinkRedirectFinddByUpdateIdAction } from './services/link.redirect/LinkRedirectFindByUpdateIdAction.service';
import { LinkRedirectFindLinkClickedByCreatedByAction } from './services/link.redirect/LinkRedirectFindLinkClickedByCreatedByAction.service';
import { UpdateReportingCreateAction } from './services/update.reporting/UpdateReportingCreateAction.service';
import { UpdateReportingFindByUpdateIdAction } from './services/update.reporting/UpdateReportingFindByUpdateIdAction.service';
import { UpdateReportingFindByUpdateIdWithoutErrorAction } from './services/update.reporting/UpdateReportingFindByUpdateIdWithoutErrorAction.service';
import { UpdateReportingUpdateAction } from './services/update.reporting/UpdateReportingUpdateAction.service';
import { UpdateReportingUpdateByResponseAction } from './services/update.reporting/UpdateReportingUpdateByResponseAction.service';
import { UpdateCreateAction } from './services/UpdateCreateAction.service';
import { UpdateDeleteByIdAction } from './services/UpdateDeleteByIdAction.service';
import { UpdateFindAction } from './services/UpdateFindAction.service';
import { UpdateFindByIdAction } from './services/UpdateFindByIdAction.service';
import { UpdateFindByIdWithoutReportingAction } from './services/UpdateFindByIdWithoutReportingAction.service';
import { UpdateHandleTrigerAction } from './services/UpdateHandleTrigerAction';
import { UpdateModelUpdateAction } from './services/UpdateModelUpdateAction.service';
import { UpdateSendTestAction } from './services/UpdateSendTestAction.service';
import { UpdatesFindByCreatedByAction } from './services/UpdatesFindByCreatedByAction.service';
import { UpdatesGetCountByCreatedByAction } from './services/UpdatesGetCountByCreatedByAction.service';
import { UpdateChargeMessageTriggerAction } from './services/UpdateTriggerAction/UpdateChargeMessageTriggerAction';
import { UpdateContactsTriggerAction } from './services/UpdateTriggerAction/UpdateContactsTriggerAction';
import { UpdateLocationTriggerAction } from './services/UpdateTriggerAction/UpdateLocationTriggerAction';
import { UpdateSegmentTriggerAction } from './services/UpdateTriggerAction/UpdateSegmentTriggerAction';
import { UpdateTaggedTriggerAction } from './services/UpdateTriggerAction/UpdateTaggedTriggerAction';
import { UpdateUpdateProgressAction } from './services/UpdateUpdateProgressAction.service';
import { UpdateController } from './update.controller';
import { UpdateReporting, UpdateReportingSchema } from './update.reporting.schema';
import { Update, UpdateSchema } from './update.schema';
import { UpdateReTriggerScheduleAction } from './services/updateReTriggerScheduleAction.service';
import { UpdateSchedule, UpdateScheduleSchema } from './update.schedule.schema';
import { UpdateHandleSendSmsAction } from './services/UpdateHandleSendSmsAction.service';

@Module({
  controllers: [UpdateController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: Update.name, schema: UpdateSchema },
      { name: UpdateReporting.name, schema: UpdateReportingSchema },
      { name: LinkRedirect.name, schema: LinkRedirectSchema },
      { name: UpdateSchedule.name, schema: UpdateScheduleSchema },
    ]),
    TagsModule,
    SegmentModule,
    PaymentMonthlyModule,
    forwardRef(() => UserModule),
    forwardRef(() => FormModule),
    forwardRef(() => MessageModule),
    forwardRef(() => FormSubmissionModule),
    forwardRef(() => PaymentModule),
  ],
  providers: [
    UpdateCreateAction,
    UpdateFindByIdAction,
    UpdateModelUpdateAction,
    UpdateFindAction,
    UpdateSendTestAction,
    UpdateTaggedTriggerAction,
    UpdateHandleTrigerAction,
    UpdateLocationTriggerAction,
    UpdateSegmentTriggerAction,
    UpdateReportingCreateAction,
    UpdateReportingUpdateAction,
    UpdateReportingFindByUpdateIdAction,
    UpdatesFindByCreatedByAction,
    UpdateReportingUpdateByResponseAction,
    LinkRediectCreateAction,
    LinkRediectCreateByMessageAction,
    LinkRedirectClickedAction,
    LinkRedirectFinddByUpdateIdAction,
    UpdateReportingFindByUpdateIdWithoutErrorAction,
    UpdateContactsTriggerAction,
    UpdateFindByIdWithoutReportingAction,
    UpdateDeleteByIdAction,
    UpdateUpdateProgressAction,
    UpdatesGetCountByCreatedByAction,
    UpdateChargeMessageTriggerAction,
    LinkRedirectFindLinkClickedByCreatedByAction,
    UpdateHandleSendSmsAction,
    UpdateReTriggerScheduleAction,
  ],
  exports: [
    UpdateReportingUpdateAction,
    UpdateReportingFindByUpdateIdAction,
    UpdatesFindByCreatedByAction,
    UpdateReportingUpdateByResponseAction,
    LinkRediectCreateAction,
    LinkRediectCreateByMessageAction,
    LinkRedirectClickedAction,
    LinkRedirectFinddByUpdateIdAction,
    UpdateFindByIdWithoutReportingAction,
    UpdateFindAction,
    UpdatesGetCountByCreatedByAction,
    LinkRedirectFindLinkClickedByCreatedByAction,
  ],
})
export class UpdateModule {}
