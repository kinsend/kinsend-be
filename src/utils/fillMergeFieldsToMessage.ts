import { UPDATE_MERGE_FIELDS } from '../modules/update/interfaces/const';

export interface MergeFieldsValue {
  fname?: string;
  lname?: string;
  name?: string;
  mobile?: string;
  email?: string;
}
const fnameRegex = new RegExp(UPDATE_MERGE_FIELDS.FNAME);
const lnameRegex = new RegExp(UPDATE_MERGE_FIELDS.LNAME);
const nameRegex = new RegExp(UPDATE_MERGE_FIELDS.NAME);
const mobileRegex = new RegExp(UPDATE_MERGE_FIELDS.MOBILE);
const emailRegex = new RegExp(UPDATE_MERGE_FIELDS.EMAIL);

export function fillMergeFieldsToMessage(message: string, mergeFieldsValue: MergeFieldsValue) {
  const { email, fname, lname, name, mobile } = mergeFieldsValue;
  const messageFilled = message.split(' ').map((item) => {
    switch (true) {
      case fnameRegex.test(item): {
        return item.replace(fnameRegex, fname || '');
      }
      case lnameRegex.test(item): {
        return item.replace(lnameRegex, lname || '');
      }
      case nameRegex.test(item): {
        return item.replace(nameRegex, name || '');
      }
      case mobileRegex.test(item): {
        return item.replace(mobileRegex, mobile || '');
      }
      case emailRegex.test(item): {
        return item.replace(emailRegex, email || '');
      }

      default: {
        return item;
      }
    }
  });
  return messageFilled.join(' ');
}
