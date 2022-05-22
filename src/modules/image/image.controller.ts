import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppRequest } from 'src/utils/AppRequest';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadAction } from './services/ImageUploadAction.service';

@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(private imageUploadAction: ImageUploadAction) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  imageUpload(
    @Req() request: AppRequest,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.imageUploadAction.execute(request, file);
  }
}
