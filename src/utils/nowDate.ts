export function now(msPlus?: number): Date {
  const ms = Date.now() + (msPlus || 0);
  return new Date(ms);
}
