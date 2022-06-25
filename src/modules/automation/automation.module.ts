import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { ImageModule } from '../image/image.module';
import { UserModule } from '../user/user.module';
import { AutomationController } from './automation.controller';
import { Automation, AutomationSchema } from './automation.schema';
import { AutomationCreateAction } from './services/AutomationCreateAction.service';

@Module({
  controllers: [AutomationController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: Automation.name, schema: AutomationSchema }]),
    UserModule,
    ImageModule,
  ],
  providers: [AutomationCreateAction],
  exports: [],
})
export class AutomationModule {}
