/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class Item {
  price: string;
}

export class CreateSubscriptionByCustomerIdDto {
  @ApiProperty({ example: 'cus_123456', required: true, type: String })
  @IsNotEmpty()
  customer: string;

  @ApiProperty({ example: [Item], required: true, type: [Item] })
  @IsArray()
  items: Item[];
}
