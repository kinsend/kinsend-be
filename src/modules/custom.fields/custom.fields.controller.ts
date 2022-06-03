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
import { CustomFieldsCreatePayload } from './dtos/CustomFieldsCreatePayload.dto';
import { CustomFieldsUpdatePayload } from './dtos/CustomFieldsUpdatePayload.dto';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { CustomFieldsCreateAction } from './services/CustomFieldsCreateAction.service';
import { CustomFieldsModule } from './custom.fields.module';
import { CustomFieldsGetAction } from './services/CustomFieldsGetAction.service';
import { CustomFieldsGetByIdAction } from './services/CustomFieldsGetByIdAction.service';
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { CustomFieldsUpdateAction } from './services/CustomFieldsUpdateAction.service';
import { CustomFieldsDeleteByIdAction } from './services/CustomFieldsDeleteByIdAction.service';
import { AppRequest } from '../../utils/AppRequest';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';

@ApiTags('CustomFields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MongooseClassSerializerInterceptor(CustomFieldsModule))
@Controller('custom-fields')
export class CustomFieldsController {
  constructor(
    private customFieldsCreateAction: CustomFieldsCreateAction,
    private customFieldsGetAction: CustomFieldsGetAction,
    private customFieldsGetByIdAction: CustomFieldsGetByIdAction,
    private customFieldsUpdateAction: CustomFieldsUpdateAction,
    private customFieldsDeleteByIdAction: CustomFieldsDeleteByIdAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  createCustomFields(
    @Req() request: AppRequest,
    @Body()
    payload: CustomFieldsCreatePayload,
  ) {
    return this.customFieldsCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('/:id')
  async updateProfile(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) tagsId: string,
    @Body() payload: CustomFieldsUpdatePayload,
  ) {
    return this.customFieldsUpdateAction.execute(request, tagsId, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/')
  getCustomFields(@Req() request: AppRequest) {
    return this.customFieldsGetAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getCustomFieldsById(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.customFieldsGetByIdAction.execute(request, id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  deleteTagsById(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) tagsId: string) {
    return this.customFieldsDeleteByIdAction.execute(request, tagsId);
  }
}
