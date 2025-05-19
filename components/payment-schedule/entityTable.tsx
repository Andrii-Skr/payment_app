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
import { FiltersBar } from "./filtersBar";
import { EntityGroupRow } from "./entityGroupRow";
import { useEntityTableLogic } from "@/lib/hooks/useEntityTableLogic";
import { usePendingPayments } from "@/lib/hooks/usePendingPayments";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Roles } from "@/constants/roles";
import { apiClient } from "@/services/api-client";
import { createPaymentDetail } from "@/lib/transformData/paymentDetail";
import { groupPaymentsByReceiver } from "@/lib/transformData/groupPayments";
import { finalizePaymentsHandler } from "@/lib/handlers/finalizePaymentsHandler";

export const EntityTable: React.FC<{
  documents: DocumentType[];
  entityNames: Record<number, string>;
  reloadDocuments: () => Promise<void>;
}> = ({ documents, entityNames, reloadDocuments }) => {
  const { canAccess } = useAccessControl();
  const canSeeDetailsModal = canAccess([Roles.ADMIN]);
  const canUseBottomPanel = canAccess(Roles.ADMIN);

  const kyivNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Kyiv" })
  );
  const day = kyivNow.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  kyivNow.setDate(kyivNow.getDate() + diff);
  kyivNow.setHours(0, 0, 0, 0);
  const initialDate = new Date(kyivNow);

  const [startDate, setStartDate] = React.useState(initialDate);
  const [period, setPeriod] = React.useState(14);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalPaymentDetails, setModalPaymentDetails] = React.useState<PaymentDetail[]>([]);
  const [partnerModalOpen, setPartnerModalOpen] = React.useState(false);
  const [selectedPartner, setSelectedPartner] = React.useState<PartnerType | null>(null);
  const [selectedPartnerDocuments, setSelectedPartnerDocuments] = React.useState<DocumentType[]>([]);
  const [selectedEntity, setSelectedEntity] = React.useState<number | "all">("all");
  const [partnerFilter, setPartnerFilter] = React.useState("");

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

  const { dateRange, groupedByEntity, formattedDateRange } = useEntityTableLogic({
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

    const paymentDetails: PaymentDetail[] = cellUnpaid.map(createPaymentDetail);
    setModalPaymentDetails(paymentDetails);
    setModalTitle(`Документы для партнёра ${paymentDetails[0].partner_name}`);
    setModalOpen(true);
  };

  const handlePartnerNameClick = (partner: PartnerType, docs: DocumentType[]) => {
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
    await finalizePaymentsHandler(
      pendingPayments,
      reloadDocuments,         // <-- порядок: reloadFn
      clearPendingPayments,    // <-- потом очистка
      "plain"
    );
  };

  const finalizeGroupedPayments = async () => {
    const grouped = groupPaymentsByReceiver(pendingPayments);
    await finalizePaymentsHandler(
      grouped,
      reloadDocuments,
      clearPendingPayments,
      "grouped",
      pendingPayments        // <-- оригинальный список для обновления статусов
    );
  };

  const onPay = async () => {
    try {
      const toUpdate = pendingPayments.map((p) => p.spec_doc_id);
      await apiClient.specDocs.updatePaymentsById({ specDocIds: toUpdate });
      clearPendingPayments();
      await reloadDocuments();
    } catch (error) {
      console.error("Ошибка при оплате платежей:", error);
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
            <TableHead className="sticky left-0 z-[30] bg-white w-10">💼</TableHead>
            <TableHead className="sticky left-10 z-[30] bg-white min-w-[180px]">Контрагент</TableHead>
            <TableHead className="sticky left-[220px] z-[30] bg-white min-w-[100px]">Остаток</TableHead>
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
          onGroupedFinalize={finalizeGroupedPayments}
          onPay={onPay}
        />
      )}
    </div>
  );
};
