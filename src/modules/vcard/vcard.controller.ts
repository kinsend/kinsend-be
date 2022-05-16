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
import { VcardCreatePayloadDto } from './dtos/VcardCreatePayload.dto';
import { VcardUpdatePayloadDto } from './dtos/VcardUpdatePayload.dto';
import { VcardCreateAction } from './services/VcardCreateAction.service';
import { VcardGetByUserContextAction } from './services/VcardGetByUserContextAction.service';
import { VcardUpdateByUserContextAction } from './services/VcardUpdateByUserContextAction.service';
import { VcardModule } from './vcard.module';


@ApiTags('vcard')
@ApiBearerAuth()
@Controller('vcard')
@UseInterceptors(MongooseClassSerializerInterceptor(VcardModule))
export class VcardController {
  constructor(
    private vcardCreateAction: VcardCreateAction,
    private vcardGetByUserContextAction: VcardGetByUserContextAction,
    private vcardUpdateByUserContextAction: VcardUpdateByUserContextAction
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(@Req() request: AppRequest, @Body() payload: VcardCreatePayloadDto) {
    return this.vcardCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getVcard(@Req() request: AppRequest) {
    return this.vcardGetByUserContextAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put()
  async updateVcard(@Req() request: AppRequest, @Body() payload: VcardUpdatePayloadDto) {
    return this.vcardUpdateByUserContextAction.execute(request, payload);
  }
}
