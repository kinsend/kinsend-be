/* eslint-disable unicorn/filename-case */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ImageUploadPayload {
  @ApiProperty({ example: true, type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isResize?: boolean;
}
