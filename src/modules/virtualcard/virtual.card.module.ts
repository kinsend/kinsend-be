import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { VirtualCardCreateAction } from './services/VirtualCardCreateAction.service';
import { VirtualCardGetByUserContextAction } from './services/VirtualCardGetByUserContextAction.service';
import { VirtualCardGetByUserIdAction } from './services/VirtualCardGetByUserIdAction.service';
import { VirtualCardGetByUserIdWithoutAction } from './services/VirtualCardGetByUserIdWithoutAction.service';
import { VirtualCardUpdateByUserContextAction } from './services/VirtualCardUpdateByUserContextAction.service';
import { VirtualCardController } from './virtual.card.controller';
import { VCard, VCardSchema } from './virtual.card.schema';

@Module({
  controllers: [VirtualCardController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: VCard.name, schema: VCardSchema }]),
    forwardRef(() => UserModule),
  ],
  providers: [
    VirtualCardCreateAction,
    VirtualCardGetByUserContextAction,
    VirtualCardUpdateByUserContextAction,
    VirtualCardGetByUserIdAction,
    VirtualCardGetByUserIdWithoutAction,
  ],
  exports: [
    VirtualCardCreateAction,
    VirtualCardGetByUserIdAction,
    VirtualCardUpdateByUserContextAction,
    VirtualCardGetByUserIdWithoutAction,
  ],
})
export class VirtualCardModule {}
