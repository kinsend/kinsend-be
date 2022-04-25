/* eslint-disable unicorn/consistent-destructuring */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AppRequest } from 'src/utils/AppRequest';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AuthVerifyApiKey } from '../auth/services/AuthVerifyApiKey.service';
import { User as UserModel } from './user.schema';
import { UserCreateAction } from './services/UserCreateAction.service';
import { UserCreatePayloadDto } from './dtos/UserCreateRequest.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(MongooseClassSerializerInterceptor(UserModel))
export class UserController {
  constructor(private userCreateAction: UserCreateAction) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(@Req() request: AppRequest, @Body() payload: UserCreatePayloadDto) {
    return this.userCreateAction.execute(request, payload);
  }
}
