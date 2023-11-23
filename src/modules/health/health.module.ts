import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '@app/shared/shared.module';
import { User, UserSchema } from '../user/user.schema';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [SharedModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
