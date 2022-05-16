import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/shared/shared.module';
import { VcardCreateAction } from './services/VcardCreateAction.service';
import { VcardGetByUserContextAction } from './services/VcardGetByUserContextAction.service';
import { VcardUpdateByUserContextAction } from './services/VcardUpdateByUserContextAction.service';
import { VcardController } from './vcard.controller';
import { Vcard, VcardSchema } from './vcard.schema';

@Module({
  controllers: [VcardController],
  imports: [SharedModule, MongooseModule.forFeature([{ name: Vcard.name, schema: VcardSchema }])],
  providers: [VcardCreateAction, VcardGetByUserContextAction, VcardUpdateByUserContextAction],
  exports: [],
})
export class VcardModule {}
