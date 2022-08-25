export enum DayEnum {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export const DayNumberEnum = new Map([
  ['Monday', 1],
  ['Tuesday', 2],
  ['Wednesday', 3],
  ['Thursday', 4],
  ['Friday', 5],
  ['Saturday', 6],
  ['Sunday', 0],
]);
export const MonthNumberEnum = new Map([
  ['Jan', 0],
  ['Feb', 1],
  ['Mar', 2],
  ['Apr', 3],
  ['May', 4],
  ['Jun', 5],
  ['Jul', 6],
  ['Aug', 7],
  ['Sep', 8],
  ['Oct', 9],
  ['Nov', 10],
  ['Dec', 11],
]);

export enum Month {
  'Jan' = '01',
  'Feb' = '02',
  'Mar' = '03',
  'Apr' = '04',
  'May' = '05',
  'Jun' = '06',
  'Jul' = '07',
  'Aug' = '08',
  'Sep' = '09',
  'Oct' = '10',
  'Nov' = '11',
  'Dec' = '12',
}

export function getNextDayOfWeek(day: DayEnum) {
  const today = new Date();
  const dayIndex = DayNumberEnum.get(day) || 0;
  today.setDate(today.getDate() + ((dayIndex - 1 - today.getDay() + 7) % 7) + 1);
  return today;
}
