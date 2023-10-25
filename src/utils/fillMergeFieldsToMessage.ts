import { UPDATE_MERGE_FIELDS } from '../modules/update/interfaces/const';

export interface MergeFieldsValue {
  fname?: string;
  lname?: string;
  name?: string;
  mobile?: string;
  email?: string;
}

const mergeFieldsMap = {
  [UPDATE_MERGE_FIELDS.FNAME]: 'fname',
  [UPDATE_MERGE_FIELDS.LNAME]: 'lname',
  [UPDATE_MERGE_FIELDS.NAME]: 'name',
  [UPDATE_MERGE_FIELDS.MOBILE]: 'mobile',
  [UPDATE_MERGE_FIELDS.EMAIL]: 'email',
};

export function fillMergeFieldsToMessage(message: string, mergeFieldsValue: MergeFieldsValue): string {
  Object.entries(mergeFieldsMap).forEach(([pattern, field]) => {
    const regex = new RegExp(pattern, 'g');
    if (mergeFieldsValue[field] && regex.test(message)) {
      message = message.replace(regex, mergeFieldsValue[field]);
    }
  });
  return message;
}