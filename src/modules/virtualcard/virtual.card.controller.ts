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
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { AppRequest } from '../../utils/AppRequest';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { VirtualCardCreatePayloadDto } from './dtos/VirtualCardCreatePayload.dto';
import { VirtualCardUpdatePayloadDto } from './dtos/VirtualCardUpdatePayload.dto';
import { VirtualCardCreateAction } from './services/VirtualCardCreateAction.service';
import { VirtualCardGetByUserContextAction } from './services/VirtualCardGetByUserContextAction.service';
import { VirtualCardUpdateByUserContextAction } from './services/VirtualCardUpdateByUserContextAction.service';

import { VirtualCardModule } from './virtual.card.module';

@ApiTags('vcards')
@ApiBearerAuth()
@Controller('vcards')
@UseInterceptors(MongooseClassSerializerInterceptor(VirtualCardModule))
export class VirtualCardController {
  constructor(
    private vCardCreateAction: VirtualCardCreateAction,
    private vCardGetByUserContextAction: VirtualCardGetByUserContextAction,
    private vCardUpdateByUserContextAction: VirtualCardUpdateByUserContextAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(@Req() request: AppRequest, @Body() payload: VirtualCardCreatePayloadDto) {
    return this.vCardCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getVCard(@Req() request: AppRequest) {
    return this.vCardGetByUserContextAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put()
  async updateVCard(@Req() request: AppRequest, @Body() payload: VirtualCardUpdatePayloadDto) {
    return this.vCardUpdateByUserContextAction.execute(request, payload);
  }
}
