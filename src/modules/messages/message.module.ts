import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { UserModule } from '../user/user.module';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './message.schema';
import { MessageCreateAction } from './services/MessageCreateAction.service';
import { MessagesFindAction } from './services/MessagesFindAction.service';
import { MessagesFindbyFormSubmissionAction } from './services/MessagesFindbyFormSubmissionAction.service';

@Module({
  imports: [
    forwardRef(() => FormSubmissionModule),
    UserModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [MessageController],
  providers: [MessageCreateAction, MessagesFindAction, MessagesFindbyFormSubmissionAction],
  exports: [MessageCreateAction],
})
export class MessageModule {}
