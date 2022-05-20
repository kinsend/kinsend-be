import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TagsUpdatePayloadDto {
  @ApiProperty({ example: 'tags name', required: false, type: String })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 1, required: false, type: Number })
  @IsString()
  @IsOptional()
  contact?: number;

  @ApiProperty({ example: 1, required: false, type: Number })
  @IsString()
  @IsOptional()
  unknown?: number;
}
