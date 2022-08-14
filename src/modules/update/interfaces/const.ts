/* eslint-disable @typescript-eslint/naming-convention */
export enum INTERVAL_TRIGGER_TYPE {
  ONCE = 'Once',
  EVERY_DAY = 'Every day',
  EVERY_OTHER_DAY = 'Every other day',
  EVERY_WEEK = 'Every week',
  EVERY_OTHER_WEEK = 'Every other week',
  EVERY_MONTH = 'Every month',
  EVERY_3_MONTHS = 'Every 3 months',
  EVERY_YEAR = 'Every year',
}

export enum UPDATE_PROGRESS {
  DONE = 'Done',
  SCHEDULED = 'Scheduled',
}

export enum UPDATE_MERGR_FIELDS {
  FNAME = '<fname>',
  LNAME = '<lname>',
  NAME = '<name>',
  MOBILE = '<mobile>',
  FORM = '<form>',
  EMAIL = '<email>',
}
