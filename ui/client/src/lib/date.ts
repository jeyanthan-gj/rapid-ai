export const INDIA_TIME_ZONE = "Asia/Kolkata";

export function todayInIndia(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isTodayInIndia(date: string): boolean {
  return date === todayInIndia();
}
