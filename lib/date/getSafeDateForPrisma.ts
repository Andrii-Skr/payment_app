export function getSafeDateForPrisma(dateInput: string | Date): Date {
  let year: number, month: number, day: number;

  if (typeof dateInput === "string") {
    const isoString = dateInput.includes("T")
      ? dateInput.split("T")[0]
      : dateInput;

    [year, month, day] = isoString.split("-").map(Number);
  } else {
    year = dateInput.getUTCFullYear();
    month = dateInput.getUTCMonth() + 1;
    day = dateInput.getUTCDate();
  }

  return new Date(Date.UTC(year, month - 1, day));
}
