/* eslint-disable unicorn/consistent-destructuring */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Multer } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AuthVerifyApiKey } from '../auth/services/AuthVerifyApiKey.service';
import { User as UserModel } from './user.schema';
import { UserCreateAction } from './services/UserCreateAction.service';
import { UserCreatePayloadDto } from './dtos/UserCreateRequest.dto';
import { UserResendEmailAction } from './services/UserResendEmailAction.service';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { UserGetProfileAction } from './services/UserGetProfileAction.service';
import { UserUpdateProfilePayloadDto } from './dtos/UserUpdateProfilePayload.dto';
import { UserUpdateProfileAction } from './services/UserUpdateProfileAction.service';
import { UserPasswordUpdatePayload } from './dtos/UserUpdatePasswordPayload.dto';
import { UserUpdatePasswordAction } from './services/UserUpdatePasswordAction.service';
import { UserUpdatePhotoAction } from './services/UserUpdatePhotoAction.service';
import { UserDeletePhotoAction } from './services/UserDeletePhotoAction.service.';
import { AppRequest } from '../../utils/AppRequest';
import { IllegalStateException } from '../../utils/exceptions/IllegalStateException';
import { UserAddListPhonesRequest } from './dtos/UserAddListPhonesRequest.dto';
import { UserAddListPhoneCreateAction } from './services/UserAddListPhoneCreateAction.service';
import { UserResetPasswordSendEmailAction } from './services/UserResetPasswordSendEmailAction.service';
import { UserVerifyResetPasswordAction } from './services/UserVerifyResetPasswordAction.service';
import { UserResetPassword, UserVerifyResetPassword } from './dtos/UserResetPassword.dto';
import { VerificationConfirmEmailQueryDto } from '../verification/dtos/VerificationConfirmEmailQuery.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/users')
@UseInterceptors(MongooseClassSerializerInterceptor(UserModel))
export class UserController {
  constructor(
    private userCreateAction: UserCreateAction,
    private userResendEmailAction: UserResendEmailAction,
    private userGetProfileAction: UserGetProfileAction,
    private userUpdateProfileAction: UserUpdateProfileAction,
    private userUpdatePasswordAction: UserUpdatePasswordAction,
    private userUpdatePhotoAction: UserUpdatePhotoAction,
    private userDeletePhotoAction: UserDeletePhotoAction,
    private userAddListPhoneCreateAction: UserAddListPhoneCreateAction,
    private userResetPasswordSendEmailAction: UserResetPasswordSendEmailAction,
    private userVerifyResetPasswordAction: UserVerifyResetPasswordAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(@Req() request: AppRequest, @Body() payload: UserCreatePayloadDto) {
    return this.userCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('resend-verify-email')
  async resend(@Req() request: AppRequest, @Query('email') email: string) {
    return this.userResendEmailAction.execute(request, email);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('reset-password')
  async resetPassword(@Req() request: AppRequest, @Body() payload: UserResetPassword) {
    return this.userResetPasswordSendEmailAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('verify-reset-password')
  async verifyResetPassword(
    @Req() request: AppRequest,
    @Body() payload: UserVerifyResetPassword,
    @Query() query: VerificationConfirmEmailQueryDto,
  ) {
    return this.userVerifyResetPasswordAction.execute(request, query, payload);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('/me')
  async profile(@Req() request: AppRequest) {
    return this.userGetProfileAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('/me')
  async updateProfile(@Req() request: AppRequest, @Body() payload: UserUpdateProfilePayloadDto) {
    return this.userUpdateProfileAction.execute(request, payload);
  }

  @Put('/me/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(@Req() request: AppRequest, @Body() payload: UserPasswordUpdatePayload) {
    const { correlationId } = request;
    const { user, accessToken } = await this.userUpdatePasswordAction.execute(request, payload);
    if (!user || !accessToken) {
      throw new IllegalStateException(correlationId);
    }
    request.res?.setHeader('accessToken', accessToken);
    return user;
  }

  @Put('/me/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateProfilePhoto(
    @Req() request: AppRequest,
    @UploadedFile()
    photo: Express.Multer.File,
  ) {
    return this.userUpdatePhotoAction.execute(request, photo);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/me/photo')
  @UseGuards(JwtAuthGuard)
  deleteProfilePhoto(@Req() request: AppRequest) {
    return this.userDeletePhotoAction.execute(request);
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('/list-phone')
  async addListPhone(@Req() request: AppRequest, @Body() payload: UserAddListPhonesRequest) {
    return this.userAddListPhoneCreateAction.execute(request, payload);
  }
}
