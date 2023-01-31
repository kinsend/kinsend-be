import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class KeywordResponseUpdatePayload {
  @ApiProperty({ example: true, required: true, type: Boolean })
  @IsBoolean()
  @IsOptional()
  isEnable?: boolean;
}
