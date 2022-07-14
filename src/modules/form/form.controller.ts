/* eslint-disable unicorn/prevent-abbreviations */
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { FormCreatePayload } from './dtos/FormCreatePayload.dto';
import { FormModule } from './form.module';
import { FormCreateAction } from './services/FormCreateAction.service';
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { FormsGetAction } from './services/FormsGetAction.service';
import { FormGetByIdAction } from './services/FormGetByIdAction.service';
import { FormUpdateAction } from './services/FormUpdateAction.service ';
import { FormUpdatePayload } from './dtos/FormUpdatePayload.dto';
import { FormDeleteByIdAction } from './services/FormDeleteByIdAction.service';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { FormUpdateStatusAction } from './services/FormUpdateStatusAction.service';
import { FormUpdateStatusPayload } from './dtos/FormUpdateStatusPayload.dto';

@ApiTags('Forms')
@UseInterceptors(MongooseClassSerializerInterceptor(FormModule))
@Controller('forms')
export class FormController {
  constructor(
    private formCreateAction: FormCreateAction,
    private formsGetAction: FormsGetAction,
    private formGetByIdAction: FormGetByIdAction,
    private formUpdateAction: FormUpdateAction,
    private formDeleteByIdAction: FormDeleteByIdAction,
    private formUpdateStatusAction: FormUpdateStatusAction,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiExtraModels(FormCreatePayload)
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(FormCreatePayload) },
        {
          properties: {
            file: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      ],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  createForm(
    @Req() request: AppRequest,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    payload: FormCreatePayload,
  ) {
    return this.formCreateAction.execute(request, file, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiExtraModels(FormUpdatePayload)
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(FormUpdatePayload) },
        {
          properties: {
            file: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      ],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('/:id')
  async updateForm(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
    @UploadedFile()
    file: Express.Multer.File,
    @Body() payload: FormUpdatePayload,
  ) {
    return this.formUpdateAction.execute(request, id, payload, file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/')
  getForms(@Req() request: AppRequest) {
    return this.formsGetAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:parameter')
  getFormById(@Req() request: AppRequest, @Param('parameter') param: string) {
    return this.formGetByIdAction.execute(request, param);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  deleteFormById(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) tagsId: string) {
    return this.formDeleteByIdAction.execute(request, tagsId);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/status/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateStatusForm(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
    @Body()
    payload: FormUpdateStatusPayload,
  ) {
    return this.formUpdateStatusAction.execute(request, id, payload);
  }
}
