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
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import MongooseClassSerializerInterceptor from '@app/utils/interceptors/MongooseClassSerializer.interceptor';
import { AppRequest } from '@app/utils/AppRequest';
import { JwtAuthGuard } from '@app/providers/guards/JwtAuthGuard.provider';
import { TranformObjectIdPipe } from '@app/utils/ParseBigIntPipe';
import { UpdateModule } from './update.module';
import { UpdateCreatePayload } from './dtos/UpdateCreatePayload.dto';
import { UpdateCreateAction } from './services/UpdateCreateAction.service';
import { UpdateModelUpdateAction } from './services/UpdateModelUpdateAction.service';
import { UpdateModelUpdatePayload } from './dtos/UpdateModelUpdatePayload.dto';
import { UpdateFindAction } from './services/UpdateFindAction.service';
import { UpdateFindQueryQueryDto } from './dtos/UpdateFindQueryDto';
import { UpdateFindByIdAction } from './services/UpdateFindByIdAction.service';
import { UpdateSendTestAction } from './services/UpdateSendTestAction.service';
import { UpdateSendTestPayload } from './dtos/UpdateSendTestPayload.dto';
import { LinkRedirectClickedAction } from './services/link.redirect/LinkRedirectClickedAction.service';
import { UpdateDeleteByIdAction } from './services/UpdateDeleteByIdAction.service';

@ApiTags('Updates')
@UseInterceptors(MongooseClassSerializerInterceptor(UpdateModule))
@Controller('api/updates')
export class UpdateController {
  constructor(
    private updateCreateAction: UpdateCreateAction,
    private updateModelUpdateAction: UpdateModelUpdateAction,
    private updateFindAction: UpdateFindAction,
    private updateFindByIdAction: UpdateFindByIdAction,
    private updateSendTestAction: UpdateSendTestAction,
    private linkRedirectClickedAction: LinkRedirectClickedAction,
    private updateDeleteByIdAction: UpdateDeleteByIdAction, // private updateChargeMessageTriggerAction: UpdateChargeMessageTriggerAction,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createUpdate(
    @Req() request: AppRequest,
    @Body()
    payload: UpdateCreatePayload,
  ) {
    return this.updateCreateAction.execute(request, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('/:id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  updateUpdate(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) id: string,
    @Body()
    payload: UpdateModelUpdatePayload,
  ) {
    return this.updateModelUpdateAction.execute(request, id, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  getUpdates(@Req() request: AppRequest, @Query() query: UpdateFindQueryQueryDto) {
    // The `populateRecipients` path is not necessary for this endpoint.
    // We are force-overwriting any incoming REST API values to avoid overloading the database with unnecessary high volume queries.
    // This is a temporary solution before an upcoming refactoring which should address the problem in a better way.
    query.populateRecipients = false;
    return this.updateFindAction.execute(request, query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getUpdate(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.updateFindByIdAction.execute(request, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/send-test')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  sendTest(
    @Req() request: AppRequest,
    @Body()
    payload: UpdateSendTestPayload,
  ) {
    return this.updateSendTestAction.execute(request, payload);
  }

  @Get('/redirect/:url')
  async redirect(@Req() request: AppRequest, @Param('url') url: string, @Res() response: Response) {
    const redirectUrl = await this.linkRedirectClickedAction.execute(request, url);
    return response.redirect(redirectUrl);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  deleteUpdate(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) id: string) {
    return this.updateDeleteByIdAction.execute(request, id);
  }
}
