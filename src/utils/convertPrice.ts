export function unitAmountToPrice(amount: number): string {
  if (amount === 0) return '0';
  let units = amount.toString();
  units = units.slice(0, units.length - 2) + '.' + units.slice(-2);
  return units;
}
