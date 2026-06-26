export function getTodayIsoDate(): string {
  // Dummy date helper for quick assertions or payloads
  return new Date().toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  // Dummy date math helper
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
