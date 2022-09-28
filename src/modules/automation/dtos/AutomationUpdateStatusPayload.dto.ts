/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';
import { AUTOMATION_STATUS } from '../interfaces/const';

export class AutomationUpdateStatusPayload {
  @ApiProperty({
    example: AUTOMATION_STATUS.ENABLE,
    required: true,
    enum: AUTOMATION_STATUS,
    type: String,
  })
  @IsIn(Object.values(AUTOMATION_STATUS))
  @IsString()
  status: AUTOMATION_STATUS;
}
