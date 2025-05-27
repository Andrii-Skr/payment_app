// lib/date/getSafeDateForPrisma.ts
export function getSafeDateForPrisma(
  dateInput: string | Date | null | undefined
): Date | null {
  if (!dateInput) return null;

  let iso: string;

  if (typeof dateInput === "string") {
    // Приходит 'YYYY-MM-DD'
    const ok = /^\d{4}-\d{2}-\d{2}$/.test(dateInput);
    if (!ok) return null;
    iso = `${dateInput}T00:00:00Z`; // UTC-полночь нужного дня
  } else {
    // Date → берём UTC-день, месяц, год
    iso = new Date(
      Date.UTC(
        dateInput.getUTCFullYear(),
        dateInput.getUTCMonth(),
        dateInput.getUTCDate()
      )
    ).toISOString();
  }

  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d; // Prisma примет Date
}
