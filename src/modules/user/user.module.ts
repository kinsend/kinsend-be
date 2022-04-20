import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { UserCreateAction } from './UserCreate/UserCreateAction.service';

@Module({
  controllers: [UserController],
  imports: [SharedModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UserCreateAction],
})
export class UserModule {}
