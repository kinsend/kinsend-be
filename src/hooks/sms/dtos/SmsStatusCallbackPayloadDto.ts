import { ApiProperty } from '@nestjs/swagger';

export class SmsStatusCallbackPayloadDto {
  @ApiProperty({
    example: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    type: String,
  })
  account_sid: string;

  @ApiProperty({
    example: '2010-04-01',
    type: String,
  })
  api_version: string;

  @ApiProperty({
    example: 'McAvoy or Stewart? These timelines can get so confusing.',
    type: String,
  })
  body: string;

  @ApiProperty({
    example: 'Thu, 30 Jul 2015 20:12:31 +0000',
    type: String,
  })
  date_created: string;

  @ApiProperty({
    example: 'Thu, 30 Jul 2015 20:12:31 +0000',
    type: String,
  })
  date_sent: string;

  @ApiProperty({
    example: 'Thu, 30 Jul 2015 20:12:31 +0000',
    type: String,
  })
  date_updated: string;

  @ApiProperty({
    example: 'outbound-api',
    type: String,
  })
  direction: string;

  @ApiProperty({
    example: '+15017122661',
    type: String,
  })
  from: string;

  @ApiProperty({
    example: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    type: String,
  })
  messaging_service_sid: string;

  @ApiProperty({
    example: '0',
    type: String,
  })
  num_media: string;

  @ApiProperty({
    example: '1',
    type: String,
  })
  num_segments: string;

  @ApiProperty({
    example: 'sent',
    type: String,
  })
  status: string;

  @ApiProperty({
    example: '+15558675310',
    type: String,
  })
  to: string;

  @ApiProperty({
    example: 'SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    type: String,
  })
  sid: string;
}
