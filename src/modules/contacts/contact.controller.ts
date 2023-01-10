import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { HistoryImportContactModule } from './contact.module';
import { ContactImportHistoryCreateAction } from './services/ContactImportHistoryCreateAction.service';
import { HistoryImportContactGetByUserIdAction } from './services/HistoryImportContactGetByUserIdAction.service';
import { ContactImport, ContactImportPayload } from './dtos/ContactImportPayload';
import { ContactImportAction } from './services/ContactImportAction.service';

@ApiTags('Contacts')
@UseInterceptors(MongooseClassSerializerInterceptor(HistoryImportContactModule))
@Controller('api/contacts')
export class HistoryImportContactController {
  @Inject() historyImportContacCreateAction: ContactImportHistoryCreateAction;
  @Inject() historyImportContactGetByUserIdAction: HistoryImportContactGetByUserIdAction;
  @Inject() contactImportAction: ContactImportAction;

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The history import contacts response',
    type: HistoryImportContactModule,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/history')
  getHistoryImportContacts(@Req() request: AppRequest) {
    return this.historyImportContactGetByUserIdAction.execute(request);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The history import contacts response',
    type: HistoryImportContactModule,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/import')
  importContacts(@Req() request: AppRequest, @Body() payload: ContactImportPayload) {
    return this.contactImportAction.execute(request, payload);
  }
}
