import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { ResourceController } from './resource.controller';

@Module({
  controllers: [ResourceController],
  imports: [SharedModule],
})
export class ResourceModule {}
