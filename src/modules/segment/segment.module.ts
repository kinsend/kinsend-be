import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { SegmentController } from './segment.controller';
import { Segment, SegmentSchema } from './segment.schema';
import { SegmentCreateAction } from './services/SegmentCreateAction.service';
import { SegmentFindAction } from './services/SegmentFindAction.service';
import { SegmentFindByIdAction } from './services/SegmentFindByIdAction.service';
import { SegmentUpdateAction } from './services/SegmentUpdateAction.service';

@Module({
  controllers: [SegmentController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: Segment.name, schema: SegmentSchema }]),
    forwardRef(() => UserModule),
  ],
  providers: [SegmentCreateAction, SegmentFindByIdAction, SegmentUpdateAction, SegmentFindAction],
  exports: [SegmentFindByIdAction],
})
export class SegmentModule {}
