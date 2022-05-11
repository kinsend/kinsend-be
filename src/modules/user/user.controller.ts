/* eslint-disable unicorn/consistent-destructuring */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AppRequest } from 'src/utils/AppRequest';
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
import { IllegalStateException } from 'src/utils/exceptions/IllegalStateException';
import { UserUpdatePasswordAction } from './services/UserUpdatePasswordAction.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(MongooseClassSerializerInterceptor(UserModel))
export class UserController {
  constructor(
    private userCreateAction: UserCreateAction,
    private userResendEmailAction: UserResendEmailAction,
    private userGetProfileAction: UserGetProfileAction,
    private userUpdateProfileAction: UserUpdateProfileAction,
    private userUpdatePasswordAction: UserUpdatePasswordAction,
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
}
