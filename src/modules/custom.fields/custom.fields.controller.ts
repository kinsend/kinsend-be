/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable unicorn/consistent-destructuring */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/providers/guards/JwtAuthGuard.provider';
import { AppRequest } from 'src/utils/AppRequest';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { CustomFieldsModule } from './custom.fields.module';

@ApiTags('custom-fields')
@ApiBearerAuth()
@Controller('custom-fields')
@UseInterceptors(MongooseClassSerializerInterceptor(CustomFieldsModule))
export class CustomFieldsController {
  constructor() {
    // todo
  }
}
