import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class HistoryImportContactCreatePayload {
  @ApiProperty({ example: 1, type: Number, required: true })
  @IsNumber()
  numbersContact: number;

  @ApiProperty({ example: 10, type: Number, required: true })
  @IsNumber()
  numbersColumnMapped: number;
}
