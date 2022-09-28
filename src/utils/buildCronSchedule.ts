export function buildCronSchedule(
  min?: string,
  hour?: string,
  dayOfMonth?: string,
  month?: string,
  dayOfWeek?: string,
) {
  let response = min ? `${min}` : '*';
  response += hour ? ` ${hour}` : ' *';
  response += dayOfMonth ? ` ${dayOfMonth}` : ' *';
  response += month ? ` ${month}` : ' *';
  response += dayOfWeek ? ` ${dayOfWeek}` : ' *';

  return response;
}
