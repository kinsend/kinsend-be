import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { UpdateFindByIdAction } from './services/UpdateFindByIdAction.service';
import { UpdateModelUpdateAction } from './services/UpdateModelUpdateAction.service';
import { UpdateCreateAction } from './services/UpdateCreateAction.service';
import { UpdateController } from './update.controller';
import { Update, UpdateSchema } from './update.schema';
import { UpdateFindAction } from './services/UpdateFindAction.service';
import { UpdateSendTestAction } from './services/UpdateSendTestAction.service';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { TagsModule } from '../tags/tags.module';
import { FormModule } from '../form/form.module';
import { UpdateTaggedTriggerAction } from './services/UpdateTriggerAction/UpdateTaggedTriggerAction';
import { UpdateHandleTrigerAction } from './services/UpdateHandleTrigerAction';
import { UpdateLocationTriggerAction } from './services/UpdateTriggerAction/UpdateLocationTriggerAction';
import { UpdateSegmentTriggerAction } from './services/UpdateTriggerAction/UpdateSegmentTriggerAction';
import { SegmentModule } from '../segment/segment.module';
import { UpdateReporting, UpdateReportingSchema } from './update.reporting.schema';
import { UpdateReportingCreateAction } from './services/update.reporting/UpdateReportingCreateAction.service';
import { UpdateReportingUpdateAction } from './services/update.reporting/UpdateReportingUpdateAction.service';
import { UpdateReportingFindByUpdateIdAction } from './services/update.reporting/UpdateReportingFindByUpdateIdAction.service';
import { UpdatesFindByCreatedByAction } from './services/UpdatesFindByCreatedByAction.service';
import { UpdateReportingUpdateByResponseAction } from './services/update.reporting/UpdateReportingUpdateByResponseAction.service';
import { LinkRedirect, LinkRedirectSchema } from './link.redirect.schema';
import { LinkRediectCreateByMessageAction } from './services/link.redirect/LinkRediectCreateByMessageAction.service';
import { LinkRediectCreateAction } from './services/link.redirect/LinkRediectCreateAction.service';
import { LinkRedirectClickedAction } from './services/link.redirect/LinkRedirectClickedAction.service';
import { LinkRedirectFinddByUpdateIdAction } from './services/link.redirect/LinkRedirectFindByUpdateIdAction.service';
import { UpdateReportingFindByUpdateIdWithoutErrorAction } from './services/update.reporting/UpdateReportingFindByUpdateIdWithoutErrorAction.service';
import { UpdateContactsTriggerAction } from './services/UpdateTriggerAction/UpdateContactsTriggerAction';
import { UpdateFindByIdWithoutReportingAction } from './services/UpdateFindByIdWithoutReportingAction.service';
import { UpdateDeleteByIdAction } from './services/UpdateDeleteByIdAction.service';
import { UpdateUpdateProgressAction } from './services/UpdateUpdateProgressAction.service';
import { MessageModule } from '../messages/message.module';

@Module({
  controllers: [UpdateController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: Update.name, schema: UpdateSchema },
      { name: UpdateReporting.name, schema: UpdateReportingSchema },
      { name: LinkRedirect.name, schema: LinkRedirectSchema },
    ]),
    UserModule,
    FormSubmissionModule,
    TagsModule,
    FormModule,
    SegmentModule,
    forwardRef(() => MessageModule),
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
  ],
  exports: [
    UpdateReportingUpdateAction,
    UpdateReportingFindByUpdateIdAction,
    UpdatesFindByCreatedByAction,
    UpdateReportingUpdateByResponseAction,
    LinkRediectCreateAction,
    LinkRediectCreateByMessageAction,
    LinkRedirectClickedAction,
  ],
})
export class UpdateModule {}
