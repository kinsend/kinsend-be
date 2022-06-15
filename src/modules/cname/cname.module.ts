import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { FormModule } from '../form/form.module';
import { UserModule } from '../user/user.module';
import { VirtualCardModule } from '../virtualcard/virtual.card.module';
import { CNAMEController } from './cname.controller';
import { CNAME, CNAMESchema } from './cname.schema';
import { CNAMECreateAction } from './services/CNAMECreateAction.service';
import { CNAMEUpdateAction } from './services/CNAMEUpdateAction.service';

@Module({
  controllers: [CNAMEController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: CNAME.name, schema: CNAMESchema }]),
    FormModule,
    UserModule,
    VirtualCardModule,
  ],
  providers: [CNAMECreateAction, CNAMEUpdateAction],
  exports: [],
})
export class CNAMEModule {}
