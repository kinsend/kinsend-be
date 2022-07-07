/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/naming-convention */
import { Form } from '../form.schema';

export enum OPTIONAL_FIELDS {
  GENDER = 'GENDER',
  BIRTHDAY = 'BIRTHDAY',
  TWITTER = 'TWITTER',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  JOB = 'JOB',
  TITLE = 'TITLE',
  COMPANY = 'COMPANY',
  INDUSTRY = 'INDUSTRY',
}

export const BOOLEAN_ARR = ['true', 'false'];

export interface FormResponse extends Form {
  totalSubscriber?: number;
}
