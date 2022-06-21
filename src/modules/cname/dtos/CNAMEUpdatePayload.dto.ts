/* eslint-disable unicorn/filename-case */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsLowercase, IsOptional, Validate } from 'class-validator';
import { ValidateDomainService } from '../../../shared/services/validate.domain.service';

export class CNAMEUpdatePayload {
  @ApiProperty({ example: 'cname-title', type: String, required: false })
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  @IsOptional()
  @Validate(ValidateDomainService)
  title?: string;
}
