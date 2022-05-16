import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/shared/shared.module';
import { VCardCreateAction } from './services/VCardCreateAction.service';
import { VCardGetByUserContextAction } from './services/VCardGetByUserContextAction.service';
import { VCardUpdateByUserContextAction } from './services/VCardUpdateByUserContextAction.service';
import { VCardController } from './vcard.controller';
import { VCard, VCardSchema } from './vcard.schema';

@Module({
  controllers: [VCardController],
  imports: [SharedModule, MongooseModule.forFeature([{ name: VCard.name, schema: VCardSchema }])],
  providers: [VCardCreateAction, VCardGetByUserContextAction, VCardUpdateByUserContextAction],
  exports: [VCardCreateAction],
})
export class VCardModule {}
