export const formatBankAccount = (iban: string) => {
  if (!iban) return "";

  const part1 = iban.slice(0, 2);
  const part2 = iban.slice(2, 4);
  const part3 = iban.slice(4, 10);
  const rest = iban.slice(10);

  return `${part1} ${part2} ${part3} ${rest}`;
};
