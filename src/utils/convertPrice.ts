const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
export function unitAmountToPrice(amount: number): string {
  if (amount === 0) return '0';
  const amountUsd = formatter.format(amount / 100);
  return amountUsd;
}
