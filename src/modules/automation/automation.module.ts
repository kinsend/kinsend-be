import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { ImageModule } from '../image/image.module';
import { TagsModule } from '../tags/tags.module';
import { UserModule } from '../user/user.module';
import { AutomationController } from './automation.controller';
import { Automation, AutomationSchema } from './automation.schema';
import { AutomationCreateAction } from './services/AutomationCreateAction.service';
import { AutomationCreateTriggerAutomationAction } from './services/AutomationCreateTriggerAutomationAction.service';
import { AutomationDeleteByIdAction } from './services/AutomationDeleteByIdAction.service';
import { AutomationGetByIdAction } from './services/AutomationGetByIdAction.service';
import { AutomationsGetAction } from './services/AutomationsGetAction.service';
import { AutomationsGetByUserIdsAction } from './services/AutomationsGetByUserIdsAction.service';
import { AutomationTriggerContactCreatedAction } from './services/AutomationTriggerAction/AutomationTriggerContactCreatedAction.service';
import { AutomationTriggerContactTaggedAction } from './services/AutomationTriggerAction/AutomationTriggerContactTaggedAction.service';
import { AutomationTriggerFirstMessageAction } from './services/AutomationTriggerAction/AutomationTriggerFirstMessageAction.service';
import { AutomationUpdateAction } from './services/AutomationUpdateAction.service';
import { AutomationUpdateStatusAction } from './services/AutomationUpdateStatusAction.service';
import { Task, TaskSchema } from './task.schema';

@Module({
  controllers: [AutomationController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: Automation.name, schema: AutomationSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    forwardRef(() => UserModule),
    ImageModule,
    TagsModule,
  ],
  providers: [
    AutomationCreateAction,
    AutomationsGetAction,
    AutomationGetByIdAction,
    AutomationUpdateAction,
    AutomationDeleteByIdAction,
    AutomationCreateTriggerAutomationAction,
    AutomationTriggerFirstMessageAction,
    AutomationTriggerContactCreatedAction,
    AutomationTriggerContactTaggedAction,
    AutomationsGetByUserIdsAction,
    AutomationUpdateStatusAction,
  ],
  exports: [
    AutomationCreateTriggerAutomationAction,
    AutomationsGetByUserIdsAction,
    AutomationTriggerContactCreatedAction,
  ],
})
export class AutomationModule {}
