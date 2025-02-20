import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { TranformObjectIdPipe } from '@app/utils/ParseBigIntPipe';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { FormSubmissionModule } from './form.submission.module';
import { FormSubmissionCreatePayload } from './dtos/FormSubmissionCreatePayload.dto';
import { FormSubmissionCreateAction } from './services/FormSubmissionCreateAction.service';
import { FormSubmissionGetLocationsAction } from './services/FormSubmissionGetLocationsAction.service';
import { SubmissionLocationResponseDto } from './dtos/SubmissionLocationResponseDto';
import { FormSubmissionsGetAction } from './services/FormSubmissionsGetAction.service';
import { FormSubmissionUpdateAction } from './services/FormSubmissionUpdateAction.service';
import { FormSubmission } from './form.submission.schema';
import { FormSubmissionUpdatePayload } from './dtos/FormSubmissionUpdatePayload.dto';
import { FormSubmissionSendVcardAction } from './services/FormSubmissionSendVcardAction.service';
import { FormSubmissionFindByIdAction } from './services/FormSubmissionFindByIdAction.service';
import { FormSubmissionDeleteAllDocumentsAction } from './services/FormSubmissionDeleteAllDocumentsAction.service';

@ApiTags('FormSubmission')
@UseInterceptors(MongooseClassSerializerInterceptor(FormSubmissionModule))
@Controller('api/form-submission')
export class FormSubmissionController {
  constructor(
    private formSubmissionCreateAction: FormSubmissionCreateAction,
    private formSubmissionGetLocationsAction: FormSubmissionGetLocationsAction,
    private formSubmissionsGetAction: FormSubmissionsGetAction,
    private formSubmissionUpdateAction: FormSubmissionUpdateAction,
    private formSubmissionSendVcardAction: FormSubmissionSendVcardAction,
    private formSubmissionFindByIdAction: FormSubmissionFindByIdAction,
    private formSubmissionsDeleteAllDocumentsAction: FormSubmissionDeleteAllDocumentsAction,
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
  getSubmissions(
    @Req() request: AppRequest, 
    @Query('limit', ParseIntPipe) limit : number, 
    @Query('pageNumber', ParseIntPipe) pageNumber : number,
    @Query('searchFilter') searchFilter : string
  ) {

    if(searchFilter){
      searchFilter = searchFilter.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
    }
   
    return this.formSubmissionsGetAction.execute(request, limit, pageNumber, searchFilter);

  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The subscribers response',
    type: FormSubmission,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getFormSubmission(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.formSubmissionFindByIdAction.execute(request, id);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'The subscribers response',
    type: FormSubmission,
    isArray: true,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  updateFormSubmission(
    @Req() request: AppRequest,
    @Body() payload: FormSubmissionUpdatePayload,
    @Param('id', TranformObjectIdPipe) id: string,
  ) {
    return this.formSubmissionUpdateAction.execute(request, id, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/:id/send-vcard')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  sendVcard(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.formSubmissionSendVcardAction.execute(request, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('/')
  deleteAllForms(
    @Req() request: AppRequest,
    @Body() data: {formSubmissionIds : string[]},
  ) {
    
    return this.formSubmissionsDeleteAllDocumentsAction.execute(request, data.formSubmissionIds);
    
  }
}
