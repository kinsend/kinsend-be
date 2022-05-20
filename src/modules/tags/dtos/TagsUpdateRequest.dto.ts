import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TagsUpdatePayloadDto {
  @ApiProperty({ example: 'tags name', required: false, type: String })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'tags name', required: false, type: String })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({ example: 'tags name', required: false, type: String })
  @IsString()
  @IsOptional()
  unknow?: string;
}
