import {
  Body,
  Controller,
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
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { CNAMEModule } from './cname.module';
import { CNAMECreateAction } from './services/CNAMECreateAction.service';
import { CNAMECreatePayload } from './dtos/CNAMECreatePayload.dto';
import { CNAMEUpdateAction } from './services/CNAMEUpdateAction.service';
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { CNAMEUpdatePayload } from './dtos/CNAMEUpdatePayload.dto';

@ApiTags('CNAME')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cnames')
@UseInterceptors(MongooseClassSerializerInterceptor(CNAMEModule))
export class CNAMEController {
  constructor(
    private cnameCreateAction: CNAMECreateAction,
    private cnameUpdateAction: CNAMEUpdateAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createCNAME(
    @Req() request: AppRequest,
    @Body()
    payload: CNAMECreatePayload,
  ) {
    return this.cnameCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateCNAME(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
    @Body()
    payload: CNAMEUpdatePayload,
  ) {
    return this.cnameUpdateAction.execute(request, id, payload);
  }
}
