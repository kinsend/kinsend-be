import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

export function regionPhoneNumber(phone: string): string | undefined {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const number = phoneUtil.parseAndKeepRawInput(phone);
  return phoneUtil.getRegionCodeForNumber(number);
}

export function convertPhoneNumberRegion(phone: string, region: string): string {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const number = phoneUtil.parseAndKeepRawInput(phone, region);
  return phoneUtil.format(number, PhoneNumberFormat.E164);
}
