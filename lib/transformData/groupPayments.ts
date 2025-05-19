import { PaymentDetail } from "@/types/types";
import { buildPurposeFromTemplate } from "./buildPurposeFromTemplate";

/**
 * Группировка платежей по entity_id + partner_id + account_number.
 * Если doc_id совпадает — пересчитываем назначение платежа.
 */
export function groupPaymentsByReceiver(payments: PaymentDetail[]): PaymentDetail[] {
  const map = new Map<string, PaymentDetail[]>();

  for (const payment of payments) {
    const key = `${payment.entity_id}-${payment.partner_id}-${payment.partner_account_number}`;
    if (!map.has(key)) {
      map.set(key, [payment]);
    } else {
      map.get(key)!.push(payment);
    }
  }

  return Array.from(map.values()).map((group) => {
    const [first] = group;
    const total = group.reduce((sum, p) => sum + p.pay_sum, 0);
    const docGroups = new Map<number, PaymentDetail[]>();

    // Группируем по doc_id
    for (const p of group) {
      if (!docGroups.has(p.doc_id)) docGroups.set(p.doc_id, []);
      docGroups.get(p.doc_id)!.push(p);
    }

    const purposes: string[] = [];

    for (const [_, docPayments] of docGroups) {
      const base = docPayments[0];
      const sameTemplate = docPayments.every(
        (p) => p.vat_type === base.vat_type && p.vat_percent === base.vat_percent
      );
      const docSum = docPayments.reduce((s, p) => s + p.pay_sum, 0);

      if (
        sameTemplate &&
        docPayments.every((p) => p.purpose_of_payment.startsWith("Оплата услуг №"))
      ) {
        const purpose = buildPurposeFromTemplate(
          base.purpose_of_payment,
          base.vat_percent ?? null,
          docSum,
          base.vat_type ?? false
        );
        purposes.push(purpose);
      } else {
        purposes.push(...docPayments.map((p) => p.purpose_of_payment));
      }
    }

    return {
      ...first,
      pay_sum: +total.toFixed(2),
      purpose_of_payment: purposes.join(", "),
    };
  });
}
