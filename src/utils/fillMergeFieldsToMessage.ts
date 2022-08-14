import { UPDATE_MERGR_FIELDS } from '../modules/update/interfaces/const';

export interface MergeFieldsValue {
  fname?: string;
  lname?: string;
  name?: string;
  mobile?: string;
  email?: string;
}
export function fillMergeFieldsToMessage(message: string, mergeFieldsValue: MergeFieldsValue) {
  const messageFilled = message.split(' ').map((item) => {
    switch (item) {
      case UPDATE_MERGR_FIELDS.FNAME: {
        return mergeFieldsValue.fname;
      }
      case UPDATE_MERGR_FIELDS.LNAME: {
        return mergeFieldsValue.lname;
      }
      case UPDATE_MERGR_FIELDS.NAME: {
        return mergeFieldsValue.name;
      }
      case UPDATE_MERGR_FIELDS.MOBILE: {
        return mergeFieldsValue.mobile;
      }
      case UPDATE_MERGR_FIELDS.EMAIL: {
        return mergeFieldsValue.email;
      }

      default: {
        return item;
      }
    }
  });
  return messageFilled.join(' ');
}
