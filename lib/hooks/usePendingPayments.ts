import { usePaymentStore } from "@/store/store";
import { PaymentDetail } from "@/types/types";
import { useMemo } from "react";
import { toast } from "@/lib/hooks/use-toast";

export const usePendingPayments = () => {
  const pendingPayments = usePaymentStore((state) => state.pendingPayments);
  const setPendingPayments = usePaymentStore(
    (state) => state.setPendingPayments
  );
  const clearPendingPayments = usePaymentStore(
    (state) => state.clearPendingPayments
  );

  const groupedPayments = useMemo(() => {
    return pendingPayments.reduce((acc, p) => {
      if (!acc[p.partner_id])
        acc[p.partner_id] = { name: p.partner_name, total: +p.pay_sum };
      else acc[p.partner_id].total += +p.pay_sum;
      return acc;
    }, {} as Record<number, { name: string; total: number }>);
  }, [pendingPayments]);

  const overallTotal = useMemo(() => {
    return pendingPayments.reduce((acc, p) => acc + +p.pay_sum, 0);
  }, [pendingPayments]);

  const update = (newDetails: PaymentDetail[], existingIds: number[]) => {
    const filtered = pendingPayments.filter(
      (p) => !existingIds.includes(p.spec_doc_id)
    );

    const all = [...filtered, ...newDetails];
    const uniqueEntityIds = new Set(all.map((p) => p.entity_id));

    if (uniqueEntityIds.size > 1) {
      toast.error("Нельзя выбрать документы из разных организаций");
      return;
    }

    setPendingPayments(all);
  };

  return {
    pendingPayments,
    groupedPayments,
    overallTotal,
    setPendingPayments,
    clearPendingPayments,
    update,
  };
};
