import { ApiProperty } from '@nestjs/swagger';

export class MesageStatisticDto {
  @ApiProperty({
    example: 100,
    required: true,
    type: Number,
  })
  totalFormSubmission: number;

  @ApiProperty({
    example: 100,
    required: true,
    type: Number,
  })
  totalUpdate: number;

  @ApiProperty({
    example: 100,
    required: true,
    type: Number,
  })
  clickedPercent: number;
}
