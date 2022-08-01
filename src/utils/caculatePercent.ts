/* eslint-disable curly */
export function caculatePercent(a?: number, b?: number) {
  if (!a || !b) return 0;
  return Math.round((a / b) * 100);
}
