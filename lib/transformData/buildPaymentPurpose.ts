import { format } from "date-fns";
import { AUTO_PURPOSE_MARKER } from "@/constants/marker";

export type BuildPaymentPurposeArgs = {
  mainPurpose: string;
  paySum: number;
  accountNumber: string;
  date: Date;
  vatType: boolean;
  vatPercent: number | null | undefined;
  isAuto: boolean;
};

export function buildPaymentPurpose({
  mainPurpose,
  paySum,
  accountNumber,
  date,
  vatType,
  vatPercent,
  isAuto,
}: BuildPaymentPurposeArgs): string {
  const [userPartRaw] = mainPurpose.split(AUTO_PURPOSE_MARKER);
  const userPart = userPartRaw?.trim() ?? "";

  if (!isAuto) {
    return userPart;
  }

  const base = `${userPart} ${AUTO_PURPOSE_MARKER} ${accountNumber} від ${format(date, "dd.MM.yyyy")}`;

  if (!vatType || vatPercent == null) {
    return `${base}, без ПДВ`;
  }

  const vat = paySum - paySum / (1 + vatPercent / 100);
  const formattedVat = vat.toFixed(2).replace(".", ",");
  return `${base}, у т.ч. ПДВ ${vatPercent}% = ${formattedVat} грн.`;
}
