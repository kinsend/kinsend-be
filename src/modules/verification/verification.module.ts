import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';

@Module({
  controllers: [VerificationController],
})
export class VerificationModule {}
