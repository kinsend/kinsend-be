/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';
import { FORM_STATUS } from '../../automation/interfaces/const';

export class FormUpdateStatusPayload {
  @ApiProperty({
    example: FORM_STATUS.ENABLE,
    required: true,
    enum: FORM_STATUS,
    type: String,
  })
  @IsIn(Object.values(FORM_STATUS))
  @IsString()
  status: FORM_STATUS;
}
