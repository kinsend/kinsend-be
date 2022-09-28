import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserUpdateProfilePayloadDto {
  @ApiProperty({ example: 'firstname', type: String })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'lastname', type: String })
  @IsOptional()
  @IsString()
  lastName?: string;
}
