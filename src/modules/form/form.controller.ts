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
import { JwtAuthGuard } from 'src/providers/guards/JwtAuthGuard.provider';
import { AppRequest } from 'src/utils/AppRequest';
import MongooseClassSerializerInterceptor from 'src/utils/interceptors/MongooseClassSerializer.interceptor';
import { FormCreatePayload } from './dtos/FormCreatePayload.dto';
import { FormModule } from './form.module';
import { FormCreateAction } from './services/FormCreateAction.service';
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { FormsGetAction } from './services/FormsGetAction.service';
import { FormGetByIdAction } from './services/FormGetByIdAction.service';
import { FormUpdateAction } from './services/FormUpdateAction.service ';
import { FormUpdatePayload } from './dtos/FormUpdatePayload.dto';
import { FormDeleteByIdAction } from './services/FormDeleteByIdAction.service';

@ApiTags('Forms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(MongooseClassSerializerInterceptor(FormModule))
@Controller('forms')
export class FormController {
  constructor(
    private formCreateAction: FormCreateAction,
    private formsGetAction: FormsGetAction,
    private formGetByIdAction: FormGetByIdAction,
    private formUpdateAction: FormUpdateAction,
    private formDeleteByIdAction: FormDeleteByIdAction,
  ) {}

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

  @HttpCode(HttpStatus.OK)
  @Get('/')
  getForms(@Req() request: AppRequest) {
    return this.formsGetAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getFormById(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.formGetByIdAction.execute(request, id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  deleteFormById(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) tagsId: string) {
    return this.formDeleteByIdAction.execute(request, tagsId);
  }
}
