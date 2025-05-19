// 📁 lib/transformData/buildPurposeFromTemplate.ts

export function buildPurposeFromTemplate(
  template: string,
  vatPercent: number | null,
  totalSum: number,
  vatType: boolean
): string {
  const [base] = template
    .split("у т.ч. ПДВ")
    .map((s) => s.trim().replace(/,+$/, "")); // remove trailing comma

  if (vatType && vatPercent != null) {
    const vat = (totalSum * vatPercent) / (100 + vatPercent);
    const formattedVat = vat.toFixed(2).replace(".", ",");
    return `${base}, у т.ч. ПДВ ${vatPercent}% = ${formattedVat} грн.`;
  } else {
    return `${base}, без ПДВ`;
  }
}
