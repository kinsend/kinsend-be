import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsMongoId,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { DURATION, TRIGGER_TYPE } from '../interfaces/const';

export class AutomationCreatePayload {
  @ApiProperty({
    example: TRIGGER_TYPE.CONTACT_CREATED,
    required: true,
    enum: TRIGGER_TYPE,
    type: String,
  })
  @IsIn(Object.values(TRIGGER_TYPE), { each: true })
  @IsString()
  @IsNotEmpty()
  triggerType: TRIGGER_TYPE;

  @ApiProperty({ example: '12345678o', type: String, required: false })
  @IsMongoId()
  @IsOptional()
  userTaggedId?: string;

  @ApiProperty({ example: false, type: String, required: false })
  @IsBoolean()
  @IsOptional()
  isStopTrigger?: boolean;

  @ApiProperty({ example: 'Los Angeles (GMT-7)', required: false, type: String })
  @IsString()
  @IsOptional()
  timeZone?: string;

  @ApiProperty({ example: 'Fri Jun 17 2022 14:07:49', required: true, type: Date })
  @IsString()
  dateTrigger: string;

  @ApiProperty({ example: 'Say something....', required: true, type: String, maxLength: 260 })
  @IsString()
  @MaxLength(260)
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: DURATION.UNTIL_DATE,
    required: true,
    enum: DURATION,
    type: String,
  })
  @IsIn(Object.values(DURATION), { each: true })
  @IsString()
  @IsNotEmpty()
  duration: DURATION;
}
