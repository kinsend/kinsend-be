const dayOfWeek = ['0', '1', '2', '3', '4', '5', '6'];
export function buildOtherDayOfWeek(date: Date) {
  const day = date.getDay();
  // eslint-disable-next-line unicorn/prevent-abbreviations
  const datStr = day.toString();
  return dayOfWeek.filter((item) => item !== datStr).join(',');
}
