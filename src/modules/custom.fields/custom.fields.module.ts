import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { CustomFieldsController } from './custom.fields.controller';
import { CustomFieldsCreateAction } from './services/CustomFieldsCreateAction.service';
import { CustomFields, CustomFieldsSchema } from './custom.fields.schema';
import { CustomFieldsGetAction } from './services/CustomFieldsGetAction.service';
import { CustomFieldsGetByIdAction } from './services/CustomFieldsGetByIdAction.service';
import { CustomFieldsUpdateAction } from './services/CustomFieldsUpdateAction.service';
import { CustomFieldsDeleteByIdAction } from './services/CustomFieldsDeleteByIdAction.service';

@Module({
  controllers: [CustomFieldsController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: CustomFields.name, schema: CustomFieldsSchema }]),
  ],
  providers: [
    CustomFieldsCreateAction,
    CustomFieldsGetAction,
    CustomFieldsGetByIdAction,
    CustomFieldsUpdateAction,
    CustomFieldsDeleteByIdAction,
  ],
  exports: [CustomFieldsGetByIdAction],
})
export class CustomFieldsModule {}
