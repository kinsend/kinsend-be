/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PLAN_PAYMENT_METHOD } from 'src/modules/plan-subscription/plan-subscription.constant';
import { PhoneNumber } from './UserResponse.dto';

export class PlanSubscription {
  @ApiProperty({ example: 'Lo', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({ example: 'Lo', required: true, type: String, enum: PLAN_PAYMENT_METHOD })
  @IsString()
  @IsNotEmpty()
  planPaymentMethod: PLAN_PAYMENT_METHOD;
}

export class UserCreatePayloadDto {
  @ApiProperty({ example: 'lorem@gmail.com', type: String })
  @MaxLength(50)
  @IsLowercase()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456@abc' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Lo', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Rem', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'https://facebook.com/user', required: false, type: String })
  @IsString()
  @IsOptional()
  oneSocial?: string;

  @ApiProperty({ example: [PhoneNumber], required: true, type: [PhoneNumber] })
  @IsArray()
  @IsOptional()
  phoneNumber?: [PhoneNumber];

  @ApiProperty({
    type: PlanSubscription,
    required: true,
  })
  @IsObject()
  @ValidateNested()
  @IsNotEmptyObject()
  @Type(() => PlanSubscription)
  planSubscription: PlanSubscription;
}
