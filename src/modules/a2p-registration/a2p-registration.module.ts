/* eslint-disable @typescript-eslint/naming-convention */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from 'src/configs/config.service';
import { A2PRegistrationController } from './a2p-registration.controller';
import { A2pRegistration, A2pRegistrationSchema } from './a2p-registration.schema';
import { A2pRegistrationTrustHubService } from './services/a2p-registration.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: A2pRegistration.name, schema: A2pRegistrationSchema }]),
  ],
  providers: [A2pRegistrationTrustHubService, ConfigService],
  controllers: [A2PRegistrationController],
})
export class a2pRegistrationModule {}
