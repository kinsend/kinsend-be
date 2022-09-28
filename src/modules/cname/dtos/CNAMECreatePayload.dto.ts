/* eslint-disable unicorn/filename-case */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsLowercase, Validate } from 'class-validator';
import { ValidateDomainService } from '../../../shared/services/validate.domain.service';

export class CNAMECreatePayload {
  @ApiProperty({ example: 'cname-title', type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  @Validate(ValidateDomainService)
  title: string;
}
