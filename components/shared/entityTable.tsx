"use client";
import React, { useState } from "react";
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
import { DocumentType, PaymentDetail, PaymentEntry } from "../../types/types";
import { FiltersBar } from "./filtersBar";
import { EntityGroupRow } from "./entityGroupRow";
import { useEntityTableLogic } from "@/lib/hooks/useEntityTableLogic";
import { usePendingPayments } from "@/lib/hooks/usePendingPayments";
import { apiClient } from "@/services/api-client";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Roles } from "@/constants/roles";
import { toast } from "@/lib/hooks/use-toast";

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

  const [startDate, setStartDate] = useState<Date>(initialDate);
  const [period, setPeriod] = useState<number>(14);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalPaymentDetails, setModalPaymentDetails] = useState<
    PaymentDetail[]
  >([]);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<
    DocumentType["partners"] | null
  >(null);
  const [selectedPartnerDocuments, setSelectedPartnerDocuments] = useState<
    DocumentType[]
  >([]);
  const [selectedEntity, setSelectedEntity] = useState<number | "all">("all");
  const [partnerFilter, setPartnerFilter] = useState("");

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
      account_number: entry.document.account_number,
      purpose_of_payment: entry.document.purpose_of_payment,
      dead_line_date: entry.spec_doc.dead_line_date,
      date: entry.document.date,
      pay_sum: entry.spec_doc.pay_sum,
    }));

    setModalPaymentDetails(paymentDetails);
    setModalTitle(`Документы для партнёра ${paymentDetails[0].partner_name}`);
    setModalOpen(true);
  };

  const handlePartnerNameClick = (
    partner: DocumentType["partners"],
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
      const toUpdate = pendingPayments.map((p) => p.spec_doc_id);
      await apiClient.specDoc.updatePaymentsById({ specDocIds: toUpdate });
      clearPendingPayments();
      await reloadDocuments();
      toast.success("Платежи успешно завершены.");
    } catch (error) {
      console.error("Ошибка при завершении платежей:", error);
      toast.error("Ошибка при завершении платежей.");
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
            <TableHead className="sticky left-[220px] z-[30] bg-white min-w-[100px]">
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
