type DateObject = {
  hours: number;
  minutes: number;
};
// day is 9:33 PM
export function convertDateToDateObject(day: string): DateObject {
  const reg = /( AM| PM)/;
  const daysplit = day.split(':');
  const response = {
    hours: Number(daysplit[0]),
    minutes: Number(daysplit[1].replace(reg, '')),
  };
  if (day.includes('PM')) {
    response.hours += 12;
  }
  return response;
}
