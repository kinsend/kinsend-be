import { Module } from '@nestjs/common';
import { UpdateModule } from '../update/update.module';
import { RedirectController } from './redirect.controller';

@Module({
  controllers: [RedirectController],
  imports: [UpdateModule],
  providers: [],
  exports: [],
})
export class RedirectModule {}
