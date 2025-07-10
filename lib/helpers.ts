import { Decimal } from "@prisma/client/runtime/library";

/** Принимаем дату в любом виде, возвращаем Date или null */
type MaybeDate = Date | string | null | undefined;

const toDate = (d: MaybeDate): Date | null => {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d);
};

export const isSameDay = (d1: MaybeDate, d2: MaybeDate): boolean => {
  const date1 = toDate(d1);
  const date2 = toDate(d2);
  if (!date1 || !date2) return false;

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDisplayDate = (spec: {
  expected_date?: MaybeDate;
  dead_line_date?: MaybeDate;
}): Date | null => toDate(spec.expected_date ?? spec.dead_line_date);

export const formatMoney = (value: number | Decimal): string =>
  Number(value).toFixed(2);

const colors = [
  "bg-blue-100",
  "bg-green-200",
  "bg-yellow-100",
  "bg-red-100",
  "bg-purple-100",
  "bg-orange-100",
  "bg-pink-100",
  "bg-teal-100",
  "bg-lime-100",
  "bg-cyan-100",
  "bg-rose-200",
  "bg-amber-200",
  "bg-violet-200",
  "bg-sky-100",
  "bg-fuchsia-100",
  "bg-emerald-100",
];

export const getColorForEntity = (entityId: number | string): string => {
  const id = Number(entityId);
  return colors[id % colors.length];
};
