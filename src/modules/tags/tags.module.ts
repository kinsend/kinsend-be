import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { VirtualCardModule } from '../virtualcard/virtual.card.module';
import { TagsCreateAction } from './services/TagsCreateAction.service';
import { TagsDeleteByIdAction } from './services/TagsDeleteByIdAction.service';
import { TagsDeleteByIdsAction } from './services/TagsDeleteByIdsAction.service';
import { TagsGetAction } from './services/TagsGetAction.service';
import { TagsGetByIdAction } from './services/TagsGetByIdAction.service';
import { TagsGetByIdsAction } from './services/TagsGetByIdsAction.service';
import { TagsUpdateByIdAction } from './services/TagsUpdateByIdAction.service';
import { TagsController } from './tags.controller';
import { Tags, TagsSchema } from './tags.schema';

@Module({
  controllers: [TagsController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: Tags.name, schema: TagsSchema }]),
    VirtualCardModule,
  ],
  providers: [
    TagsCreateAction,
    TagsGetAction,
    TagsGetByIdAction,
    TagsUpdateByIdAction,
    TagsDeleteByIdAction,
    TagsGetByIdsAction,
    TagsDeleteByIdsAction,
  ],
  exports: [TagsGetByIdAction, TagsGetByIdsAction, TagsDeleteByIdsAction],
})
export class TagsModule {}
