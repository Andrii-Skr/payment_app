export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getDisplayDate = (spec: {
  expected_date?: string;
  dead_line_date?: string;
}) =>
  spec.expected_date
    ? new Date(spec.expected_date)
    : new Date(spec.dead_line_date!);

export const formatMoney = (value: number): string => value.toFixed(2);

const colors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-red-100",
  "bg-purple-100",
  "bg-indigo-100",
];

export const getColorForEntity = (entityId: number | string): string => {
  const id = Number(entityId);
  return colors[id % colors.length];
};
