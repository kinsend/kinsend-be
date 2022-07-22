import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { FormSubmissionModule } from './form.submission.module';
import { FormSubmissionCreatePayload } from './dtos/FormSubmissionCreatePayload.dto';
import { FormSubmissionCreateAction } from './services/FormSubmissionCreateAction.service';
import { FormSubmissionGetLocationsAction } from './services/FormSubmissionGetLocationsAction.service';
import { SubmissionLocationResponseDto } from './dtos/SubmissionLocationResponseDto';
import { FormSubmissionsGetAction } from './services/FormSubmissionsGetAction.service';
import { FormSubmission } from './form.submission.schema';

@ApiTags('FormSubmission')
@UseInterceptors(MongooseClassSerializerInterceptor(FormSubmissionModule))
@Controller('form-submission')
export class FormSubmissionController {
  constructor(
    private formSubmissionCreateAction: FormSubmissionCreateAction,
    private formSubmissionGetLocationsAction: FormSubmissionGetLocationsAction,
    private formSubmissionsGetAction: FormSubmissionsGetAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createForm(
    @Req() request: AppRequest,
    @Body()
    payload: FormSubmissionCreatePayload,
  ) {
    return this.formSubmissionCreateAction.execute(request, payload);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The subscriber locations response',
    type: SubmissionLocationResponseDto,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/locations')
  getLocaltions(@Req() request: AppRequest) {
    return this.formSubmissionGetLocationsAction.execute(request);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The subscribers response',
    type: FormSubmission,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('')
  getSubmissions(@Req() request: AppRequest) {
    return this.formSubmissionsGetAction.execute(request);
  }
}
