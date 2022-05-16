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
import { VCardCreatePayloadDto } from './dtos/VCardCreatePayload.dto';
import { VCardUpdatePayloadDto } from './dtos/VCardUpdatePayload.dto';
import { VCardCreateAction } from './services/VCardCreateAction.service';
import { VCardGetByUserContextAction } from './services/VCardGetByUserContextAction.service';
import { VCardUpdateByUserContextAction } from './services/VCardUpdateByUserContextAction.service';
import { VCardModule } from './vcard.module';


@ApiTags('vcards')
@ApiBearerAuth()
@Controller('vcards')
@UseInterceptors(MongooseClassSerializerInterceptor(VCardModule))
export class VCardController {
  constructor(
    private vCardCreateAction: VCardCreateAction,
    private vCardGetByUserContextAction: VCardGetByUserContextAction,
    private vCardUpdateByUserContextAction: VCardUpdateByUserContextAction
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(@Req() request: AppRequest, @Body() payload: VCardCreatePayloadDto) {
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
  async updateVCard(@Req() request: AppRequest, @Body() payload: VCardUpdatePayloadDto) {
    return this.vCardUpdateByUserContextAction.execute(request, payload);
  }
}
