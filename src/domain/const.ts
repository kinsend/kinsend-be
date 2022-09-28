/* eslint-disable @typescript-eslint/naming-convention */
export enum STATUS {
  'ACTIVE' = 'ACTIVE',
  'INACTIVE' = 'INACTIVE',
  'DELETED' = 'DELETED',
  'VERIFIED' = 'VERIFIED',
  'ATTACHED' = 'ATTACHED',
  'DEFAULT' = 'DEFAULT',
}

export enum SIGNIN_PROVIDER {
  PASSWORD = 'PASSWORD',
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
}

export enum CUSTOM_FIELDS_TYPE {
  CHECKBOXES = 'CHECKBOXES',
  SINGLE_LINE_TEXT = 'SINGLE_LINE_TEXT',
  PARAGRAPH_TEXT = 'PARAGRAPH_TEXT',
  RADIO = 'RADIO',
  SELECT = 'SELECT',
}

export const TTL = 60;
