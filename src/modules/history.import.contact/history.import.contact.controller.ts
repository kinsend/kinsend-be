import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { TranformObjectIdPipe } from 'src/utils/ParseBigIntPipe';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { HistoryImportContactModule } from './history.import.contact.module';
import { HistoryImportContacCreateAction } from './services/HistoryImportContacCreateAction.service';
import { HistoryImportContactGetByUserIdAction } from './services/HistoryImportContactGetByUserIdAction.service';

@ApiTags('Contacts')
@UseInterceptors(MongooseClassSerializerInterceptor(HistoryImportContactModule))
@Controller('api/contacts')
export class HistoryImportContactController {
  @Inject() historyImportContacCreateAction: HistoryImportContacCreateAction;
  @Inject() historyImportContactGetByUserIdAction: HistoryImportContactGetByUserIdAction;

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The history import contacts response',
    type: HistoryImportContactModule,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/history')
  getLocaltions(@Req() request: AppRequest) {
    return this.historyImportContactGetByUserIdAction.execute(request);
  }
}
