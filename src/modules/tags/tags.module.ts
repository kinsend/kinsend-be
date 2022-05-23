import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { VCardModule } from '../vcard/vcard.module';
import { TagsCreateAction } from './services/TagsCreateAction.service';
import { TagsDeleteByIdAction } from './services/TagsDeleteByIdAction.service';
import { TagsGetAction } from './services/TagsGetAction.service';
import { TagsGetByIdAction } from './services/TagsGetByIdAction.service';
import { TagsUpdateByIdAction } from './services/TagsUpdateByIdAction.service';
import { TagsController } from './tags.controller';
import { Tags, TagsSchema } from './tags.schema';

@Module({
  controllers: [TagsController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: Tags.name, schema: TagsSchema }]),
    VCardModule,
  ],
  providers: [
    TagsCreateAction,
    TagsGetAction,
    TagsGetByIdAction,
    TagsUpdateByIdAction,
    TagsDeleteByIdAction,
  ],
  exports: [TagsGetByIdAction],
})
export class TagsModule {}
