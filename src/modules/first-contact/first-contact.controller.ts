import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { AppRequest } from '../../utils/AppRequest';

import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { FirstContactUpdatePayload } from './dtos/first-contact-update-payload';
import { FirstContactModule } from './first-contact.module';
import { FirstContactGetAction } from './services/first-contact-get-action.service';
import { FistContactUpdateAction } from './services/first-contact-update-action.service';

@ApiTags('FirstContact')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MongooseClassSerializerInterceptor(FirstContactModule))
@Controller('api/first-contact')
export class FirstContactController {
  constructor(
    private fistContactUpdateAction: FistContactUpdateAction,
    private firstContactGetAction: FirstContactGetAction,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('/')
  getFirstContact(@Req() request: AppRequest) {
    return this.firstContactGetAction.execute(request);
  }
  @HttpCode(HttpStatus.OK)
  @Put('/')
  updateFirstContact(@Req() request: AppRequest, @Body() payload: FirstContactUpdatePayload) {
    return this.fistContactUpdateAction.execute(request, payload);
  }
}
