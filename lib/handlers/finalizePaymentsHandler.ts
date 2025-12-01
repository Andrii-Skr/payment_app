import { format } from "date-fns";
import { toast } from "@/lib/hooks/use-toast";
import { apiClient } from "@/services/api-client";
import type { PaymentDetail } from "@/types/types";
import { buildPaymentsCsv, downloadBlob } from "@/utils/paymentsCsv";

/**
 * Хендлер финализации платежей.
 */
export const finalizePaymentsHandler = async (
  exportList: PaymentDetail[],
  reloadFn: () => Promise<void>,
  clearState: () => void,
  type: "grouped" | "plain" = "plain",
  originalList?: PaymentDetail[],
) => {
  try {
    if (exportList.length === 0) {
      return;
    }

    const blob = await buildPaymentsCsv(exportList);
    const filename = `payments_${type}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    downloadBlob(blob, filename);

    const toUpdate = (originalList ?? exportList).map((p) => p.spec_doc_id);
    await apiClient.specDocs.updatePaymentsById({ specDocIds: toUpdate });

    clearState();
    await reloadFn();

    toast.success("Платежи завершены и CSV сформирован.");
  } catch (error) {
    console.error("Ошибка при завершении платежей:", error);
    toast.error("Не удалось завершить платежи.");
  }
};
