import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PhoneNumber } from './UserResponse.dto';

export class UserAddListPhonesRequest {
  @ApiProperty({ example: [PhoneNumber], required: true, type: [PhoneNumber] })
  @IsArray()
  phoneNumbers: PhoneNumber[];
}
