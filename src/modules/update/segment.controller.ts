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
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { SegmentModule } from './segment.module';
import { SegmentCreateAction } from './services/SegmentCreateAction.service';
import { SegmentCreatePayload } from './dtos/SegmentCreatePayload.dto';
import { SegmentUpdateAction } from './services/SegmentUpdateAction.service';
import { SegmentUpdatePayload } from './dtos/SegmentUpdatePayload.dto';
import { SegmentFindAction } from './services/SegmentFindAction.service';
import { SegmentFindByIdAction } from './services/SegmentFindByIdAction.service';

@ApiTags('Segments')
@UseInterceptors(MongooseClassSerializerInterceptor(SegmentModule))
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('segments')
export class SegmentController {
  constructor(
    private segmentCreateAction: SegmentCreateAction,
    private segmentUpdateAction: SegmentUpdateAction,
    private segmentFindAction: SegmentFindAction,
    private segmentFinByIddAction: SegmentFindByIdAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createSegment(
    @Req() request: AppRequest,
    @Body()
    payload: SegmentCreatePayload,
  ) {
    return this.segmentCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  updateSegment(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
    @Body()
    payload: SegmentUpdatePayload,
  ) {
    return this.segmentUpdateAction.execute(request, id, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getSegments(@Req() request: AppRequest) {
    return this.segmentFindAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getSegment(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.segmentFinByIddAction.execute(request, id);
  }
}
