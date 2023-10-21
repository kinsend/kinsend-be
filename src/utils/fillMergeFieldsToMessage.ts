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

export function fillMergeFieldsToMessage(message: string, mergeFieldsValue: MergeFieldsValue): string {
  const { email, fname, lname, name, mobile } = mergeFieldsValue;

  let processedLines = message.split('\n').map(line => {
    if (fname && fnameRegex.test(line)) {
      line = line.replace(fnameRegex, fname);
    }
    if (lname && lnameRegex.test(line)) {
      line = line.replace(lnameRegex, lname);
    }
    if (name && nameRegex.test(line)) {
      line = line.replace(nameRegex, name);
    }
    if (mobile && mobileRegex.test(line)) {
      line = line.replace(mobileRegex, mobile);
    }
    if (email && emailRegex.test(line)) {
      line = line.replace(emailRegex, email);
    }
    return line;
  });

  return processedLines.join('\n');
}