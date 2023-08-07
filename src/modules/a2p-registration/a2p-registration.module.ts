/* eslint-disable @typescript-eslint/naming-convention */
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from 'src/configs/config.service';
import { A2PRegistrationController } from './a2p-registration.controller';
import { A2pRegistration, A2pRegistrationSchema } from './a2p-registration.schema';
import { A2pRegistrationTrustHubService } from './services/a2p-registration.service';
import { A2pBrandStatusService } from './services/a2p-brand-status.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: A2pRegistration.name, schema: A2pRegistrationSchema }]),
    HttpModule,
  ],
  providers: [A2pRegistrationTrustHubService, A2pBrandStatusService, ConfigService],
  controllers: [A2PRegistrationController],
})
export class A2pRegistrationModule {}
