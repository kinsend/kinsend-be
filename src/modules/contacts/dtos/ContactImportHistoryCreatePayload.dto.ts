import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ContactImportHistoryCreatePayload {
  @ApiProperty({ example: 1, type: Number, required: true })
  @IsNumber()
  numbersContact: number;

  @ApiProperty({ example: 1, type: Number, required: true })
  @IsNumber()
  numbersContactImported: number;

  @ApiProperty({ example: 10, type: Number, required: true })
  @IsNumber()
  numbersColumnMapped: number;
}
