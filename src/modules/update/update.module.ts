import { Module } from '@nestjs/common';
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

@Module({
  controllers: [UpdateController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: Update.name, schema: UpdateSchema }]),
    UserModule,
    FormSubmissionModule,
  ],
  providers: [
    UpdateCreateAction,
    UpdateFindByIdAction,
    UpdateModelUpdateAction,
    UpdateFindAction,
    UpdateSendTestAction,
  ],
  exports: [],
})
export class UpdateModule {}
