import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { CNAMEController } from './cname.controller';
import { CNAME, CNAMESchema } from './cname.schema';
import { CNAMECreateAction } from './services/CNAMECreateAction.service';
import { CNAMEDeleteByIdAction } from './services/CNAMEDeleteByIdAction.service';
import { CNAMEGetByTitleAction } from './services/CNAMEGetByTitleAction.service';
import { CNAMEGetByUserIdAction } from './services/CNAMEGetByUserIdAction.service';
import { CNAMEGetsAction } from './services/CNAMEsGetAction.service';
import { CNAMEUpdateAction } from './services/CNAMEUpdateAction.service';

@Module({
  controllers: [CNAMEController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: CNAME.name, schema: CNAMESchema }]),
    forwardRef(() => UserModule),
  ],
  providers: [
    CNAMECreateAction,
    CNAMEUpdateAction,
    CNAMEGetByUserIdAction,
    CNAMEGetsAction,
    CNAMEDeleteByIdAction,
    CNAMEGetByTitleAction,
  ],
  exports: [
    CNAMEGetByUserIdAction,
    CNAMECreateAction,
    CNAMEUpdateAction,
    CNAMEDeleteByIdAction,
    CNAMEGetByTitleAction,
  ],
})
export class CNAMEModule {}
