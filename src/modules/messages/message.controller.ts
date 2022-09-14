import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import MongooseClassSerializerInterceptor from 'src/utils/interceptors/MongooseClassSerializer.interceptor';
import { TranformObjectIdPipe } from 'src/utils/ParseBigIntPipe';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { AppRequest } from '../../utils/AppRequest';
import { MessageCreatePayloadDto } from './dtos/MessageCreatePayloadDto.dto';
import { MessageFindDto, MessageFindQueryQueryDto } from './dtos/MessageFindQueryDto';
import { MessageModule } from './message.module';
import { MessageCreateAction } from './services/MessageCreateAction.service';
import { MessagesFindAction } from './services/MessagesFindAction.service';
import { MessagesFindbyFormSubmissionAction } from './services/MessagesFindbyFormSubmissionAction.service';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('api/messages')
@UseInterceptors(MongooseClassSerializerInterceptor(MessageModule))
export class MessageController {
  constructor(
    private messageCreateAction: MessageCreateAction,
    private messagesFindAction: MessagesFindAction,
    private messagesFindbyFormSubmissionAction: MessagesFindbyFormSubmissionAction,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createUpdate(
    @Req() request: AppRequest,
    @Body()
    payload: MessageCreatePayloadDto,
  ) {
    return this.messageCreateAction.execute(request, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  getMessages(
    @Req() request: AppRequest,
    @Query() query: MessageFindQueryQueryDto,
    @Body()
    payload: MessageFindDto,
  ) {
    return this.messagesFindAction.execute(request, query, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  getMessagesByFormSubmisson(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
  ) {
    return this.messagesFindbyFormSubmissionAction.execute(request, id);
  }
}
