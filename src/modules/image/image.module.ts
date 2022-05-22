import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { ImageController } from './image.controller';
import { ImageUploadAction } from './services/ImageUploadAction.service';

@Module({
  controllers: [ImageController],
  imports: [SharedModule],
  providers: [ImageUploadAction],
  exports: [ImageUploadAction],
})
export class ImageModule {}
