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
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '../../utils/AppRequest';
import { AutomationModule } from './automation.module';
import { AutomationCreateAction } from './services/AutomationCreateAction.service';
import { AutomationCreatePayload } from './dtos/AutomationCreatePayload.dto';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { AutomationGetByIdAction } from './services/AutomationGetByIdAction.service';
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import { AutomationsGetAction } from './services/AutomationsGetAction.service';
import { AutomationUpdateAction } from './services/AutomationUpdateAction.service';
import { AutomationUpdatePayload } from './dtos/AutomationUpdatePayload.dto';
import { AutomationDeleteByIdAction } from './services/AutomationDeleteByIdAction.service';

@ApiTags('Automation')
@UseInterceptors(MongooseClassSerializerInterceptor(AutomationModule))
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('automations')
export class AutomationController {
  constructor(
    private automationCreateAction: AutomationCreateAction,
    private automationsGetAction: AutomationsGetAction,
    private automationGetAction: AutomationGetByIdAction,
    private automationUpdateAction: AutomationUpdateAction,
    private automationDeleteByIdAction: AutomationDeleteByIdAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createAutomation(
    @Req() request: AppRequest,
    @Body()
    payload: AutomationCreatePayload,
  ) {
    return this.automationCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/')
  getAutomations(@Req() request: AppRequest) {
    return this.automationsGetAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getAutomation(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.automationGetAction.execute(request, id);
  }

  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  updateAutomation(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
    @Body()
    payload: AutomationUpdatePayload,
  ) {
    return this.automationUpdateAction.execute(request, id, payload);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  deleteAutomation(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.automationDeleteByIdAction.execute(request, id);
  }
}
