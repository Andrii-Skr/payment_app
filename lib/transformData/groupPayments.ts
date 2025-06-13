import { PaymentDetail } from "@/types/types";
import { format } from "date-fns";
import { AUTO_PURPOSE_MARKER } from "@/constants/marker";

/**
 * Группирует платежи по получателю (entity_id, partner_id, partner_account_number)
 * и формирует одну строку с общей суммой и корректным назначением платежа.
 */
export function groupPaymentsByReceiver(payments: PaymentDetail[]): PaymentDetail[] {
  const map = new Map<string, PaymentDetail[]>();

  for (const p of payments) {
    const key = `${p.entity_id}-${p.partner_id}-${p.partner_account_number}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }

  return Array.from(map.values()).map((group) => {
    const [first] = group;
    const totalSum = group.reduce((acc, p) => acc + p.pay_sum, 0);

    // --- Извлекаем пользовательскую часть из первого назначения
    const userPrefix = first.purpose_of_payment?.split(AUTO_PURPOSE_MARKER)[0]?.trim() || "";

    const autoEnabled = group.every((p) => p.is_auto_purpose_of_payment);

    // --- Подгруппировка по дате
    const byDate = new Map<string, Set<string>>();
    const vatTotals = new Map<number, number>();
    let totalVat = 0;

    group.forEach((p) => {
      const date = format(new Date(p.date), "dd.MM.yyyy");

      if (!byDate.has(date)) byDate.set(date, new Set());
      byDate.get(date)!.add(p.account_number);

      if (p.vat_type && p.vat_percent) {
        const vatAmount = p.pay_sum - p.pay_sum / (1 + p.vat_percent / 100);
        vatTotals.set(p.vat_percent, (vatTotals.get(p.vat_percent) ?? 0) + vatAmount);
        totalVat += vatAmount;
      }
    });

    // --- Формируем блоки вида: "№ acc1, acc2 від дата"
    const parts: string[] = [];
    Array.from(byDate.entries())
      .sort(([d1], [d2]) => new Date(d1).getTime() - new Date(d2).getTime())
      .forEach(([date, accounts]) => {
        const list = Array.from(accounts).sort().join(", ");
        parts.push(`${AUTO_PURPOSE_MARKER} ${list} від ${date}`);
      });

    // --- Формируем окончательное назначение платежа
    let purpose = "";

    if (!autoEnabled) {
      purpose = userPrefix;
    } else if (vatTotals.size === 0) {
      purpose = `${userPrefix} ${parts.join(", ")}, без ПДВ`;
    } else if (vatTotals.size === 1) {
      const [percent, vat] = Array.from(vatTotals.entries())[0];
      purpose = `${userPrefix} ${parts.join(", ")}, у т.ч. ПДВ ${percent}% = ${vat.toFixed(2).replace(".", ",")} грн.`;
    } else {
      const vatParts = Array.from(vatTotals.entries())
        .map(([percent, vat]) => `ПДВ ${percent}% = ${vat.toFixed(2).replace(".", ",")} грн.`)
        .join("; ");
      purpose = `${userPrefix} ${parts.join(", ")}, у т.ч. ${vatParts}`;
    }

    return {
      ...first,
      pay_sum: +totalSum.toFixed(2),
      purpose_of_payment: purpose,
    };
  });
}
