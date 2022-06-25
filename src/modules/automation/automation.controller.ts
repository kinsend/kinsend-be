import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { AutomationModule } from './automation.module';
import { AutomationCreateAction } from './services/AutomationCreateAction.service';
import { AutomationCreatePayload } from './dtos/AutomationCreatePayload.dto';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';

@ApiTags('Automation')
@UseInterceptors(MongooseClassSerializerInterceptor(AutomationModule))
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('automations')
export class AutomationController {
  constructor(private automationCreateAction: AutomationCreateAction) {}

  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(AutomationCreatePayload) },
        {
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              nullable: true,
            },
          },
        },
      ],
    },
  })
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createForm(
    @Req() request: AppRequest,
    @UploadedFile()
    file: Express.Multer.File,
    @Body()
    payload: AutomationCreatePayload,
  ) {
    return this.automationCreateAction.execute(request, file, payload);
  }
}
