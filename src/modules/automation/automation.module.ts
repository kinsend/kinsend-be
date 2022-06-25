import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { ImageModule } from '../image/image.module';
import { TagsModule } from '../tags/tags.module';
import { UserModule } from '../user/user.module';
import { AutomationController } from './automation.controller';
import { Automation, AutomationSchema } from './automation.schema';
import { AutomationCreateAction } from './services/AutomationCreateAction.service';
import { AutomationGetAction } from './services/AutomationGetAction.service';
import { AutomationsGetAction } from './services/AutomationsGetAction.service';
import { AutomationUpdateAction } from './services/AutomationUpdateAction.service';
import { Task, TaskSchema } from './task.schema';

@Module({
  controllers: [AutomationController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: Automation.name, schema: AutomationSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    UserModule,
    ImageModule,
    TagsModule,
  ],
  providers: [
    AutomationCreateAction,
    AutomationsGetAction,
    AutomationGetAction,
    AutomationUpdateAction,
  ],
  exports: [],
})
export class AutomationModule {}
