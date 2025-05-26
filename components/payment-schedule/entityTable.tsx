"use client";

import React, { useEffect, useState } from "react";
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
import { EntityWithAll } from "@/app/api/(v1)/(protected)/documents/entities/route";

export const EntityTable: React.FC<{
  entities: EntityWithAll[];
  reloadDocuments: () => Promise<void>;
}> = ({ entities, reloadDocuments }) => {
  const documents = entities.flatMap((e) => e.documents ?? []);
  const entityNames = Object.fromEntries(
    entities.map((e) => [e.id, e.short_name ?? e.full_name])
  );

  const { canAccess } = useAccessControl();
  const canSeeDetailsModal = canAccess([Roles.ADMIN]);
  const canUseQuickPayment = canAccess([Roles.ADMIN]);
  const canUseBottomPanel = canAccess(Roles.ADMIN);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [period, setPeriod] = useState(14);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalPaymentDetails, setModalPaymentDetails] = useState<PaymentDetail[]>([]);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerType | null>(null);
  const [selectedPartnerDocuments, setSelectedPartnerDocuments] = useState<DocumentType[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<number | "all">("all");
  const [partnerFilter, setPartnerFilter] = useState("");

  useEffect(() => {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Kyiv" }));
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    now.setDate(now.getDate() + diff);
    now.setHours(0, 0, 0, 0);
    setStartDate(new Date(now));
  }, []);

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

  const { dateRange, groupedByEntity, formattedDateRange } = useEntityTableLogic({
    documents,
    entities,
    startDate: startDate ?? new Date(),
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
      reloadDocuments,
      clearPendingPayments,
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
      pendingPayments
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

  if (!startDate) return null;

  // 🔑 Сортировка по sort_order через entityOrderMap
  const entityOrderMap = new Map(entities.map((e) => [e.id, e.sort_order ?? 0]));

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
          {Object.entries(groupedByEntity)
            .sort(
              ([idA], [idB]) =>
                (entityOrderMap.get(+idA) ?? 0) - (entityOrderMap.get(+idB) ?? 0)
            )
            .map(([entityId, rows]) => (
              <EntityGroupRow
                key={entityId}
                entityId={+entityId}
                rows={rows}
                dateRange={dateRange}
                entityNames={entityNames}
                pendingPayments={pendingPayments}
                onCellClick={handleCellClick}
                onPartnerClick={handlePartnerNameClick}
                canUseQuickPayment={canUseQuickPayment}
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
