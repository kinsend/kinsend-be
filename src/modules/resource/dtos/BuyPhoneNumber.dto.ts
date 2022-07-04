import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject } from 'class-validator';
import { PhoneNumber } from '../../user/dtos/UserResponse.dto';

export class BuyPhoneNumber {
  @ApiProperty({ example: PhoneNumber, required: true })
  @IsNotEmptyObject()
  phoneNumber: PhoneNumber;
}
