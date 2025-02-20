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
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import MongooseClassSerializerInterceptor from '@app/utils/interceptors/MongooseClassSerializer.interceptor';
import { TranformObjectIdPipe } from '@app/utils/ParseBigIntPipe';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { AppRequest } from '../../utils/AppRequest';
import {
  MessageCreatePayloadDto,
  MessageTestCreatePayloadDto,
} from './dtos/MessageCreatePayloadDto.dto';
import { MessageFindDto, MessageFindQueryQueryDto } from './dtos/MessageFindQueryDto';
import { MessageModule } from './message.module';
import { MessageCreateAction } from './services/MessageCreateAction.service';
import { MessagesFindAction } from './services/MessagesFindAction.service';
import { MessagesFindbyFormSubmissionAction } from './services/MessagesFindbyFormSubmissionAction.service';
import { MessageGetStatisticAction } from './services/MessageGetStatisticAction.service';
import { MesageStatisticDto } from './dtos/MesageStatisticDto';
import { MessageTestCreateAction } from './services/MessageTestCreateAction.service';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('api/messages')
@UseInterceptors(MongooseClassSerializerInterceptor(MessageModule))
export class MessageController {
  constructor(
    private messageCreateAction: MessageCreateAction,
    private messageTestCreateAction: MessageTestCreateAction,
    private messagesFindAction: MessagesFindAction,
    private messagesFindbyFormSubmissionAction: MessagesFindbyFormSubmissionAction,
    private messagesGetStatisticAction: MessageGetStatisticAction,
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
  @ApiOkResponse({
    type: MesageStatisticDto,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/statistic')
  getMessagesStatistic(@Req() request: AppRequest) {
    return this.messagesGetStatisticAction.execute(request);
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/test')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createMessagesTest(
    @Req() request: AppRequest,
    @Body()
    payload: MessageTestCreatePayloadDto,
  ) {
    return this.messageTestCreateAction.execute(request, payload);
  }
}
