"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/";
import { PaymentDetailsModal } from "./paymentDetailsModal";
import { PartnerDocumentsModal } from "./partnerDocumentsModal";
import { PaymentBottomPanel } from "./paymentBottomPanel";
import {
  DocumentType,
  PartnerType,
  PaymentDetail,
  PaymentEntry,
} from "../../types/types";
import { FiltersBar } from "../shared/filtersBar";
import { EntityGroupRow } from "./entityGroupRow";
import { useEntityTableLogic } from "@/lib/hooks/useEntityTableLogic";
import { usePendingPayments } from "@/lib/hooks/usePendingPayments";
import { apiClient } from "@/services/api-client";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Roles } from "@/constants/roles";
import { toast } from "@/lib/hooks/use-toast";
import { buildPaymentsCsv, downloadBlob } from "@/utils/paymentsCsv";
import { format } from "date-fns";

export const EntityTable: React.FC<{
  documents: DocumentType[];
  entityNames: Record<number, string>;
  reloadDocuments: () => Promise<void>;
}> = ({ documents, entityNames, reloadDocuments }) => {
  const { canAccess } = useAccessControl();

  const canSeeDetailsModal = canAccess([Roles.ADMIN]);
  const canUseBottomPanel = canAccess(Roles.ADMIN);

  const initialDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Kyiv" })
  );

  const [startDate, setStartDate] = React.useState<Date>(initialDate);
  const [period, setPeriod] = React.useState<number>(14);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalPaymentDetails, setModalPaymentDetails] = React.useState<
    PaymentDetail[]
  >([]);
  const [partnerModalOpen, setPartnerModalOpen] = React.useState(false);
  const [selectedPartner, setSelectedPartner] =
    React.useState<PartnerType | null>(null);
  const [selectedPartnerDocuments, setSelectedPartnerDocuments] =
    React.useState<DocumentType[]>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<number | "all">(
    "all"
  );
  const [partnerFilter, setPartnerFilter] = React.useState("");

  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });

  const { dateRange, groupedByEntity, formattedDateRange } =
    useEntityTableLogic({
      documents,
      startDate,
      period,
      selectedEntity,
      partnerFilter,
      collator,
    });

  const {
    pendingPayments,
    groupedPayments,
    overallTotal,
    update,
    clearPendingPayments,
  } = usePendingPayments();

  const handleCellClick = (cellUnpaid: PaymentEntry[]) => {
    if (!canSeeDetailsModal || cellUnpaid.length === 0) return;

    const paymentDetails: PaymentDetail[] = cellUnpaid.map((entry) => ({
      doc_id: entry.document.id,
      entity_id: entry.document.entity_id,
      spec_doc_id: entry.spec_doc.id,
      partner_id: entry.document.partner_id,
      partner_name: entry.document.partners.name,
      partner_entity_id: entry.document.partners.entity_id,

      partner_account_name: entry.document.partner_account_number.bank_name,
      partner_account_mfo: entry.document.partner_account_number.mfo,
      partner_account_number:
        entry.document.partner_account_number.bank_account,
      partner_account_bank_name:
        entry.document.partner_account_number.bank_name,

      account_number: entry.document.account_number,
      purpose_of_payment: entry.document.purpose_of_payment,
      dead_line_date: entry.spec_doc.dead_line_date,
      date: entry.document.date,
      pay_sum: Number(entry.spec_doc.pay_sum),
    }));

    setModalPaymentDetails(paymentDetails);
    setModalTitle(`Документы для партнёра ${paymentDetails[0].partner_name}`);
    setModalOpen(true);
  };

  const handlePartnerNameClick = (
    partner: PartnerType,
    docs: DocumentType[]
  ) => {
    setSelectedPartner(partner);
    setSelectedPartnerDocuments(docs);
    setPartnerModalOpen(true);
  };

  const handleModalSave = (selectedDetails: PaymentDetail[]) => {
    const currentBatchIds = modalPaymentDetails.map((d) => d.spec_doc_id);
    update(selectedDetails, currentBatchIds);
    setModalOpen(false);
  };

  const finalizePayments = async () => {
    try {
      /* ---------- 0. Нечего выгружать ---------- */

      /* ---------- 1. Генерируем CSV ---------- */
      const blob = await buildPaymentsCsv(pendingPayments);
      const filename = `payments_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
      downloadBlob(blob, filename);

      /* ---------- 2. Обновляем статусы платежей ---------- */
      const idsForUpdate = pendingPayments.map(p => p.spec_doc_id);
      await apiClient.specDoc.updatePaymentsById({ specDocIds: idsForUpdate });

      /* ---------- 3. Очищаем стейт и перезагружаем таблицу ---------- */
      clearPendingPayments();
      await reloadDocuments();

      toast.success("Платежи завершены и CSV сохранён.");
    } catch (error) {
      console.error("Ошибка при завершении платежей:", error);
      toast.error("Не удалось завершить платежи.");
    }
  };

  const onPay = async () => {
    try {
      const toUpdate = pendingPayments.map((p) => p.spec_doc_id);
      await apiClient.specDoc.updatePaymentsById({ specDocIds: toUpdate });
      clearPendingPayments();
      await reloadDocuments();
      toast.success("Платежи успешно оплачены.");
    } catch (error) {
      console.error("Ошибка при оплате платежей:", error);
      toast.error("Ошибка при оплате платежей.");
    }
  };

  return (
    <div>
      <FiltersBar
        startDate={startDate}
        setStartDate={setStartDate}
        period={period}
        setPeriod={setPeriod}
        selectedEntity={selectedEntity}
        setSelectedEntity={setSelectedEntity}
        partnerFilter={partnerFilter}
        setPartnerFilter={setPartnerFilter}
        entityNames={entityNames}
        dateRange={dateRange}
      />

      <Table containerClassName="overflow-y-auto max-h-[89vh]">
        <TableHeader className="bg-white sticky top-0 z-40">
          <TableRow>
            <TableHead className="sticky left-0 z-[30] bg-white w-10">
              💼
            </TableHead>
            <TableHead className="sticky left-10 z-[30] bg-white min-w-[180px]">
              Контрагент
            </TableHead>
            <TableHead className="self-start sticky left-[220px] z-[30] bg-white min-w-[100px] ">
              Остаток
            </TableHead>
            {formattedDateRange.map((d, i) => (
              <TableHead key={i}>{d}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedByEntity).map(([entityId, rows]) => (
            <EntityGroupRow
              key={entityId}
              entityId={+entityId}
              rows={rows}
              dateRange={dateRange}
              entityNames={entityNames}
              pendingPayments={pendingPayments}
              onCellClick={handleCellClick}
              onPartnerClick={handlePartnerNameClick}
            />
          ))}
        </TableBody>
      </Table>

      {modalOpen && canSeeDetailsModal && (
        <PaymentDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
          title={modalTitle}
          paymentDetails={modalPaymentDetails}
        />
      )}

      {partnerModalOpen && selectedPartner && (
        <PartnerDocumentsModal
          isOpen={partnerModalOpen}
          onClose={() => setPartnerModalOpen(false)}
          partner={selectedPartner}
          documents={selectedPartnerDocuments}
        />
      )}

      {canUseBottomPanel && (
        <PaymentBottomPanel
          pendingPayments={pendingPayments}
          groupedPayments={groupedPayments}
          overallTotal={overallTotal}
          onFinalize={finalizePayments}
          onPay={onPay}
        />
      )}
    </div>
  );
};
