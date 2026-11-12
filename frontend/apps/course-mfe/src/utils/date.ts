/** 브라우저 현지 날짜 기준 오늘(YYYY-MM-DD). toISOString()은 UTC라 한국 오전 9시 전에는 어제가 된다. */
export function todayString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
