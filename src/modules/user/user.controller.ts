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
import { Response } from 'express';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AuthVerifyApiKey } from '../auth/AuthVerifyApiKey/AuthVerifyApiKey.service';
import { User as UserModel } from './user.schema';
import { UserCreateAction } from './UserCreate/UserCreateAction.service';
import { UserCreatePayloadDto } from './UserCreate/UserCreateRequest.dto';

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
  async create(@Req() request: Request,@Res() res: Response,  @Body() payload: UserCreatePayloadDto) {
    return this.userCreateAction.execute(payload);
  }
}
