export function unitAmountToPrice(amount: number): string {
  let units = amount.toString();
  units = units.slice(0, units.length - 2) + '.' + units.slice(-2);
  return units;
}
