import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../../shared/shared.module';
import { UserController } from './user.controller';
import { User, UserSchema } from './user.schema';
import { UserCreateAction } from './services/UserCreateAction.service';
import { UserFindByIdAction } from './services/UserFindByIdAction.service';
import { UserResendEmailAction } from './services/UserResendEmailAction.service';
import { UserGetProfileAction } from './services/UserGetProfileAction.service';
import { UserFindByStripeCustomerUserIdAction } from './services/UserFindByStripeCustomerUserIdAction.service';
import { UserUpdateProfileAction } from './services/UserUpdateProfileAction.service';
import { UserUpdatePasswordAction } from './services/UserUpdatePasswordAction.service';
import { UserUpdatePhotoAction } from './services/UserUpdatePhotoAction.service';
import { UserDeletePhotoAction } from './services/UserDeletePhotoAction.service.';
import { VirtualCardModule } from '../virtualcard/virtual.card.module';
import { ImageModule } from '../image/image.module';
import { CNAMEModule } from '../cname/cname.module';
import { UserFindByEmailWithoutThrowExceptionAction } from './services/UserFindByEmailWithoutThrowExceptionAction.service';
import { UserAddListPhoneCreateAction } from './services/UserAddListPhoneCreateAction.service';
import { UserFindByPhoneSystemAction } from './services/UserFindByPhoneSystemAction.service';

@Module({
  controllers: [UserController],
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    VirtualCardModule,
    ImageModule,
    forwardRef(() => CNAMEModule),
  ],
  providers: [
    UserCreateAction,
    UserFindByIdAction,
    UserResendEmailAction,
    UserGetProfileAction,
    UserFindByStripeCustomerUserIdAction,
    UserUpdateProfileAction,
    UserUpdatePasswordAction,
    UserUpdatePhotoAction,
    UserDeletePhotoAction,
    UserFindByEmailWithoutThrowExceptionAction,
    UserAddListPhoneCreateAction,
    UserFindByPhoneSystemAction,
  ],
  exports: [
    UserCreateAction,
    UserFindByIdAction,
    UserFindByStripeCustomerUserIdAction,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserFindByEmailWithoutThrowExceptionAction,
    UserFindByPhoneSystemAction,
  ],
})
export class UserModule {}
