import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/shared/shared.module';
import { CustomFieldsController } from './custom.fields.controller';
import { CustomFields, CustomFieldsSchema } from './custom.fields.schema';

@Module({
  controllers: [CustomFieldsController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: CustomFields.name, schema: CustomFieldsSchema }]),
  ],
  providers: [],
  exports: [],
})
export class CustomFieldsModule {}
