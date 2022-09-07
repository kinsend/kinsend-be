import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormSubmissionModule } from '../form.submission/form.submission.module';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './message.schema';

@Module({
  imports: [
    FormSubmissionModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [MessageController],
  providers: [],
})
export class MessageModule {}
