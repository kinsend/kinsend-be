import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TagsCreatePayloadDto {
  @ApiProperty({ example: 'tags name', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  name: string;
}
