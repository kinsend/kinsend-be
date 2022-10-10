import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export function regionPhoneNumber(phone: string): string | undefined {
  const number = phoneUtil.parseAndKeepRawInput(phone);
  return phoneUtil.getRegionCodeForNumber(number);
}

export function convertPhoneNumberRegion(phone: string, region: string): string {
  const number = phoneUtil.parseAndKeepRawInput(phone, region);
  return phoneUtil.format(number, PhoneNumberFormat.E164);
}
