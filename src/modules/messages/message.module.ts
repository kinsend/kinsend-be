import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { SegmentModule } from '../segment/segment.module';
import { UpdateModule } from '../update/update.module';
import { UserModule } from '../user/user.module';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './message.schema';
import { MessageCreateAction } from './services/MessageCreateAction.service';
import { MessageGetStatisticAction } from './services/MessageGetStatisticAction.service';
import { MessagesFindAction } from './services/MessagesFindAction.service';
import { MessagesFindByConditionAction } from './services/MessagesFindByConditionAction.service';
import { MessagesFindbyFormSubmissionAction } from './services/MessagesFindbyFormSubmissionAction.service';
import { MessageTestCreateAction } from './services/MessageTestCreateAction.service';
import { MessageUpdateManyAction } from './services/MessageUpdateManyAction.service';

@Module({
  imports: [
    forwardRef(() => FormSubmissionModule),
    forwardRef(() => UpdateModule),
    forwardRef(() => SegmentModule),
    UserModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [MessageController],
  providers: [
    MessageCreateAction,
    MessagesFindAction,
    MessagesFindbyFormSubmissionAction,
    MessageGetStatisticAction,
    MessagesFindByConditionAction,
    MessageUpdateManyAction,
    MessageTestCreateAction,
  ],
  exports: [MessageCreateAction, MessagesFindByConditionAction, MessageUpdateManyAction],
})
export class MessageModule {}
