import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: true })
@Injectable()
export class ValidateDomainService implements ValidatorConstraintInterface {
  validate(text: string) {
    const regex =
      /^(?!-)[\w-](?!-)(?:[\w-]{0,61}[\da-z])?(?:\.(?!-)[\w-](?!-)(?:[\w-]{0,61}[\da-z])?)*$/gi;

    const isValid = text.match(regex);
    if (isValid && isValid.length > 0) {
      return true;
    }
    return false;
  }

  defaultMessage() {
    // here you can provide default error message if validation failed
    return 'Domain ($value) is not correct format!';
  }
}
