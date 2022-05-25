import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { VirtualCardCreateAction } from './services/VirtualCardCreateAction.service';
import { VirtualCardGetByUserContextAction } from './services/VirtualCardGetByUserContextAction.service';
import { VirtualCardUpdateByUserContextAction } from './services/VirtualCardUpdateByUserContextAction.service';
import { VirtualCardController } from './virtual.card.controller';
import { VCard, VCardSchema } from './virtual.card.schema';

@Module({
  controllers: [VirtualCardController],
  imports: [SharedModule, MongooseModule.forFeature([{ name: VCard.name, schema: VCardSchema }])],
  providers: [
    VirtualCardCreateAction,
    VirtualCardGetByUserContextAction,
    VirtualCardUpdateByUserContextAction,
  ],
  exports: [VirtualCardCreateAction],
})
export class VirtualCardModule {}
