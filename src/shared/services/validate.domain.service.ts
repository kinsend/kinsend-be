/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ConfigService } from '../../configs/config.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class ValidateDomainService implements ValidatorConstraintInterface {
  constructor(private readonly configService: ConfigService) {}

  validate(text: string, args: ValidationArguments) {
    const regex =
      // eslint-disable-next-line unicorn/better-regex
      /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,61}[a-zA-Z0-9]{0,1}\.([a-zA-Z]{1,6}|[a-zA-Z0-9-]{1,30})+\.([a-zA-Z]{1,6}|[a-zA-Z0-9-]{1,30}\.[a-zA-Z]{2,3})$/g;

    const isValid = `${text}.${this.configService.domain}`.match(regex);
    if (isValid && isValid.length > 0) {
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'Domain ($value) is not correct format!';
  }
}
