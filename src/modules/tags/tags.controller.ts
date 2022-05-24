/* eslint-disable unicorn/consistent-destructuring */
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
import { TranformObjectIdPipe } from '../../utils/ParseBigIntPipe';
import MongooseClassSerializerInterceptor from '../../utils/interceptors/MongooseClassSerializer.interceptor';
import { TagsModule } from './tags.module';
import { TagsCreatePayloadDto } from './dtos/TagsCreateRequest.dto';
import { JwtAuthGuard } from '../../providers/guards/JwtAuthGuard.provider';
import { TagsCreateAction } from './services/TagsCreateAction.service';
import { TagsGetAction } from './services/TagsGetAction.service';
import { TagsGetByIdAction } from './services/TagsGetByIdAction.service';
import { TagsUpdateByIdAction } from './services/TagsUpdateByIdAction.service';
import { TagsUpdatePayloadDto } from './dtos/TagsUpdateRequest.dto';
import { TagsDeleteByIdAction } from './services/TagsDeleteByIdAction.service';
import { AppRequest } from '../../utils/AppRequest';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
@UseInterceptors(MongooseClassSerializerInterceptor(TagsModule))
export class TagsController {
  constructor(
    private tagsCreateAction: TagsCreateAction,
    private tagsGetAction: TagsGetAction,
    private tagsGetByIdAction: TagsGetByIdAction,
    private tagsUpdateByIdAction: TagsUpdateByIdAction,
    private tagsDeleteByIdAction: TagsDeleteByIdAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  createTags(@Req() request: AppRequest, @Body() payload: TagsCreatePayloadDto) {
    return this.tagsCreateAction.execute(request, payload);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/')
  getTags(@Req() request: AppRequest) {
    return this.tagsGetAction.execute(request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  getTagsById(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) tagsId: string) {
    return this.tagsGetByIdAction.execute(request, tagsId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('/:id')
  async updateProfile(
    @Req() request: AppRequest,
    @Param('id', TranformObjectIdPipe) tagsId: string,
    @Body() payload: TagsUpdatePayloadDto,
  ) {
    return this.tagsUpdateByIdAction.execute(request, tagsId, payload);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  deleteTagsById(@Req() request: AppRequest, @Param('id', TranformObjectIdPipe) tagsId: string) {
    return this.tagsDeleteByIdAction.execute(request, tagsId);
  }
}
