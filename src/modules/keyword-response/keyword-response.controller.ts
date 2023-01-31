import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { AutoKeywordResponseCreatePayload } from './dtos/auto-keyword-response-create-payload';
import { AutoKeywordResponseUpdatePayload } from './dtos/auto-keyword-response-update-payload';
import { KeywordResponseUpdatePayload } from './dtos/keyword-response-update-payload';
import { KeywordResponseModule } from './keyword-response.module';
import { AutoKeywordResponseCreateAction } from './services/auto-keyword-response-create-action.service';
import { AutoKeywordResponseDeleteAction } from './services/auto-keyword-response-delete-action.service';
import { AutoKeywordResponseUpdateAction } from './services/auto-keyword-response-update-action.service';
import { KeywordResponseGetAction } from './services/keyword-response-get-action.service';
import { KeywordResponseUpdateAction } from './services/keyword-response-update-action.service';

@ApiTags('FirstContact')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MongooseClassSerializerInterceptor(KeywordResponseModule))
@Controller('api/keyword-response')
export class FirstContactController {
  constructor(
    private keywordResponseGetAction: KeywordResponseGetAction,
    private autoKeywordResponseCreateAction: AutoKeywordResponseCreateAction,
    private autoKeywordResponseUpdateAction: AutoKeywordResponseUpdateAction,
    private autoKeywordResponseDeleteAction: AutoKeywordResponseDeleteAction,
    private keywordResponseUpdateAction: KeywordResponseUpdateAction,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('/')
  getFirstContact(@Req() request: AppRequest) {
    return this.keywordResponseGetAction.execute(request);
  }
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  create(@Req() request: AppRequest, @Body() payload: AutoKeywordResponseCreatePayload) {
    return this.autoKeywordResponseCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  update(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
    @Body() payload: AutoKeywordResponseUpdatePayload,
  ) {
    return this.autoKeywordResponseUpdateAction.execute(request, id, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('')
  updateEnable(@Req() request: AppRequest, @Body() payload: KeywordResponseUpdatePayload) {
    return this.keywordResponseUpdateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  delete(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.autoKeywordResponseDeleteAction.execute(request, id);
  }
}
