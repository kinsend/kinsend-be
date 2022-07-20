/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/naming-convention */
export enum TRIGGER_TYPE {
  FIRST_MESSAGE = 'FIRST_MESSAGE',
  CONTACT_CREATED = 'CONTACT_CREATED',
  CONTACT_TAGGED = 'CONTACT_TAGGED',
}

export enum DURATION {
  TIME_FROM_TRIGGER = 'TIME_FROM_TRIGGER',
  UNTIL_NEXT_DAY = 'UNTIL_NEXT_DAY',
  UNTIL_NEXT_DAY_OF_WEEK = 'UNTIL_NEXT_DAY_OF_WEEK',
  UNTIL_NEXT_DAY_OF_MONTH = 'UNTIL_NEXT_DAY_OF_MONTH',
  UNTIL_DATE = 'UNTIL_DATE',
}

export enum STATUS {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
}

export enum TASK_TYPE {
  DELAY = 'DELAY',
  ACTION = 'ACTION',
}

export enum AUTOMATION_STATUS {
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

export enum FORM_STATUS {
  ENABLE = 'ENABLE',
  DISABLE = 'DISABLE',
}

export enum FILTERS_CONTACT {
  'ADDED_LAST_MONTH' = 'Added Last Month',
  'ADDED_LAST_WEEK' = 'Added Last Week',
  'ADDED_THIS_MONTH' = 'Added This Month',
  'ADDED_THIS_WEEK' = 'Added This Week',
  'ADDED_THIS_YEAR' = 'Added This Year',
  'AGE' = 'Age',
  'CONTACT_IS_ARCHIVED' = 'Contact is Archived',
  'HAS_ASSIGNED_NO' = 'Has Assigned No',
  'ASSIGNED_NO_IS' = 'Assigned No Is',
  'ASSIGNED_NO_IS_NOT' = "Assigned No Isn't",
  'BIRTHDAYS_IS' = 'Birthday is',
  'BIRTHDAYS_THIS_MONTH' = 'Birthdays This Month',
  'BIRTHDAYS_THIS_WEEK' = 'Birthdays This Week',
  'BIRTHDAYS_TODAY' = 'Birthdays Today',
  'COMPANY' = 'Company',
  'HAS_BEEN_CONTACTED' = 'Has been Contacted',
  'HAS_NOT_BEEN_CONTACTED' = "Hasn't Been Contacted",
  'CONTACTED_LAST_MONTH' = 'Contacted Last Month',
  'CONTACTED_LAST_WEEK' = 'Contacted Last Week',
  'CONTACTED_THIS_MONTH' = 'Contacted This Month',
  'CONTACTED_THIS_WEEK' = 'Contacted This Week',
  'CONTACTED_THIS_YEAR' = 'Contacted This Year',
  'CREATED_DATE' = 'Created Date',
  'IS_CUSTOMER' = 'Is Customer',
  'EMAIL' = 'Email',
  'IS_FACEBOOK_CONTACT' = 'Is Facebook Contact',
  'FORM_COMPLETED' = 'Form Completed',
  'HAS_FORM' = 'Has Form',
  'HAS_NOT_COMPLETED_FORM' = "Hasn't Completed Form",
  'HAS_GENDER' = 'Has Gender',
  'GENDER_IS' = 'Gender is',
  'CONTACT_IS_HIDDEN' = 'Contact is Hidden',
  'CONTACT_IS_NOT_HIDDEN' = "Contact isn't Hidden",
  'INDUSTRY' = 'Industry',
  'JOB_TITLE' = 'Job Title',
  'LAST_CONTACTED' = 'Last Contacted',
  'LAST_UPDATED' = 'Last Updated',
  'CLICKED' = 'Clicked',
  'LIVES_IN' = 'Lives In',
  'DO_NOT_LIVES_IN' = "Doesn't Lives In",
  'MESSAGES_EXCHANGED' = 'Messages Exchanged',
  'MESSAGES_INCOMING' = 'Messages Incoming',
  'MESSAGES_OUTGOING' = 'Messages Outgoing',
  'MOBILE' = 'Mobile',
  'HAS_PURCHASED' = 'Has Purchased',
  'HAS_NOT_PURCHASED' = "Hasn't Purchased",
  'PURCHASED' = 'Purchased',
  'DID_NOT_PURCHASED' = "Didn't Purchased",
  'RESPONDED' = 'Responded',
  'REVENUE' = 'Revenue',
  'SEND_UPDATE' = 'Send Update',
  'WAS_NOT_SEND_UPDATE' = "Wasn't Send Update",
  'IS_SUBSCRIBED' = 'Is Subscribed',
  'IS_NOT_SUBSCRIBED' = "Isn't Subscribed",
  'IS_TAGGED' = 'Is Tagged',
  'IS_NOT_TAGGED' = "Isn't Tagged",
  'IS_VIP' = 'Is VIP',
  'IS_NOT_VIP' = "Isn't VIP",
}

export enum CONDITION {
  IS = 'Is',
  ABOVE = 'Above',
  BELOW = 'Bellow',
  IS_AND_ABOVE = 'Is & Above',
  IS_AND_BELLOW = 'Is & Bellow',
}

export enum TEXT_CONDITION {
  EXIST = 'Exist',
  DO_NOT_EXIST = "Doesn't Exist",
  IS = 'Is',
  CONTAINS = 'Contains',
  STARTS_WITH = 'Starts With',
}

export enum DATE_CONDITION {
  ON = 'On',
  BEFORE = 'Before',
  AFTER = 'After',
}
