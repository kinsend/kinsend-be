/* eslint-disable @typescript-eslint/naming-convention */
import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from 'src/configs/config.service';
import { SharedModule } from 'src/shared/shared.module';
import { PaymentMonthlyModule } from '../payment.monthly/payment.monthly.module';
import { PaymentModule } from '../payment/payment.module';
import { UserModule } from '../user/user.module';
import { A2PRegistrationController } from './a2p-registration.controller';
import { A2pRegistration, A2pRegistrationSchema } from './a2p-registration.schema';
import { A2pBrandCampaignCharge } from './services/a2p-brand-campaign-charge.service';
import { A2pBrandStatusService } from './services/a2p-brand-status.service';
import { A2pRegistrationTrustHubService } from './services/a2p-registration.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: A2pRegistration.name, schema: A2pRegistrationSchema }]),
    HttpModule,
    forwardRef(() => UserModule),
    forwardRef(() => PaymentModule),
    SharedModule,
    PaymentMonthlyModule,
  ],
  providers: [
    A2pRegistrationTrustHubService,
    A2pBrandStatusService,
    ConfigService,
    A2pBrandCampaignCharge,
  ],
  controllers: [A2PRegistrationController],
})
export class A2pRegistrationModule {}
