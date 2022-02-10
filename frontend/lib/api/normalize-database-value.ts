export default function normalizeDatabaseValue(val: string): string {
  return val.replace(/\r?\n|\r/g, "").trim();
}
