/* eslint-disable unicorn/prevent-abbreviations */
import { PhoneNumber } from '../modules/user/dtos/UserResponse.dto';

// Input: "+16204980664";
export function convertStringToPhoneNumber(phoneStr: string): PhoneNumber {
  const phoneFormated = phoneStr.replace('+', '').trim();
  return {
    code: Number(phoneFormated[0]),
    phone: phoneFormated.slice(1),
    short: '',
  };
}
