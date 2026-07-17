"use client";

import type React from "react";
import { useEffect, useState } from "react";
import type { EntityWithAll } from "@/app/api/(v1)/(protected)/documents/entities/route";
import { ChoiceDialog, Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/";
import { Roles } from "@/constants/roles";
import { finalizePaymentsHandler } from "@/lib/handlers/finalizePaymentsHandler";
import { toast } from "@/lib/hooks/use-toast";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { useEntityTableLogic } from "@/lib/hooks/useEntityTableLogic";
import { usePendingPayments } from "@/lib/hooks/usePendingPayments";
import { groupPaymentsByReceiver } from "@/lib/transformData/groupPayments";
import { createPaymentDetail } from "@/lib/transformData/paymentDetail";
import { apiClient } from "@/services/api-client";
import { useEntitySelectionStore } from "@/store/entitySelectionStore";
import type { DocumentType, PartnerType, PaymentDetail, PaymentEntry } from "@/types/types";
import { EntityGroupRow } from "./entityGroupRow";
import { FiltersBar } from "./filtersBar";
import { PartnerDocumentsModal } from "./partnerDocumentsModal";
import { PaymentBottomPanel } from "./paymentBottomPanel";
import { PaymentDetailsModal } from "./paymentDetailsModal";

export const EntityTable: React.FC<{
  entities: EntityWithAll[];
  reloadDocuments: () => Promise<void>;
}> = ({ entities, reloadDocuments }) => {
  /* ---------- flatten & helpers ---------- */
  const documents = entities.flatMap((e) => e.documents ?? []);
  const entityNames = Object.fromEntries(entities.map((e) => [e.id, e.short_name ?? e.full_name]));

  /* ---------- ACL ---------- */
  const { canAccess } = useAccessControl();
  const canSeeDetailsModal = canAccess([Roles.ADMIN]);
  const canUseQuickPayment = canAccess([Roles.ADMIN]);
  const canUseBottomPanel = canAccess(Roles.ADMIN);

  /* ---------- ui state ---------- */
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [period, setPeriod] = useState(14);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalPaymentDetails, setModalPaymentDetails] = useState<PaymentDetail[]>([]);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerType | null>(null);
  const [selectedPartnerDocuments, setSelectedPartnerDocuments] = useState<DocumentType[]>([]);
  const selectedEntity = useEntitySelectionStore((s) => s.selectedEntity);
  const setSelectedEntity = useEntitySelectionStore((s) => s.setSelectedEntity);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [pendingPartnerShortName, setPendingPartnerShortName] = useState<string>("");

  /* confirm-dialog */
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingVisibilityPartnerId, setPendingVisibilityPartnerId] = useState<number | null>(null);
  const [pendingEntityId, setPendingEntityId] = useState<number | null>(null);

  /* ---------- calc monday ---------- */
  useEffect(() => {
    const kyivNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Kyiv" }));
    const day = kyivNow.getDay();
    const daysToSubtract = (day === 0 ? 7 : day) + 1;
    kyivNow.setDate(kyivNow.getDate() - daysToSubtract);
    kyivNow.setHours(0, 0, 0, 0);
    setStartDate(kyivNow);
  }, []);

  /* ---------- table logic ---------- */
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });
  const { dateRange, groupedByEntity, formattedDateRange } = useEntityTableLogic({
    documents,
    entities,
    startDate: startDate ?? new Date(),
    period,
    selectedEntity,
    partnerFilter,
    collator,
  });

  /* ---------- pending payments ---------- */
  const { pendingPayments, overallTotal, update, clearPendingPayments } = usePendingPayments();

  /* ---------- cell / partner click ---------- */
  const handleCellClick = (cellUnpaid: PaymentEntry[]) => {
    if (!canSeeDetailsModal || !cellUnpaid.length) return;
    const details = cellUnpaid.map(createPaymentDetail);
    setModalPaymentDetails(details);
    setModalTitle(`Документы для партнёра ${details[0].partner_name}`);
    setModalOpen(true);
  };

  const handlePartnerNameClick = (partner: PartnerType, docs: DocumentType[]) => {
    setSelectedPartner(partner);
    setSelectedPartnerDocuments(docs);
    setPartnerModalOpen(true);
  };

  /* ---------- modal save ---------- */
  const handleModalSave = (selected: PaymentDetail[]) => {
    update(
      selected,
      modalPaymentDetails.map((d) => d.spec_doc_id),
    );
    setModalOpen(false);
  };

  /* ---------- top-up / finalize ---------- */
  const finalizePayments = async () =>
    finalizePaymentsHandler(pendingPayments, reloadDocuments, clearPendingPayments, "plain");

  const finalizeGroupedPayments = async () => {
    const grouped = groupPaymentsByReceiver(pendingPayments);
    finalizePaymentsHandler(grouped, reloadDocuments, clearPendingPayments, "grouped", pendingPayments);
  };

  const onPay = async () => {
    try {
      const ids = pendingPayments.map((p) => p.spec_doc_id);
      await apiClient.specDocs.updatePaymentsById({ specDocIds: ids });
      clearPendingPayments();
      await reloadDocuments();
    } catch {
      console.error("Ошибка при оплате платежей");
    }
  };

  /* ---------- visibility ---------- */
  const handleToggleVisibilityRequest = (partnerId: number, shortName: string, entityId: number) => {
    setPendingVisibilityPartnerId(partnerId);
    setPendingEntityId(entityId);
    setPendingPartnerShortName(shortName);
    setConfirmDialogOpen(true);
  };

  const handleToggleVisibility = async (partnerId: number, visible: boolean, entityId: number) => {
    try {
      await apiClient.partners.togglePartnerVisibility(partnerId, visible, entityId);
      toast.success("Контрагент скрыт");
      await reloadDocuments();
    } catch {
      toast.error("Ошибка при скрытии контрагента");
    }
  };

  /* ---------- sort order ---------- */
  const entityOrderMap = new Map(entities.map((e) => [e.id, e.sort_order ?? 0]));

  if (!startDate) return null;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
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

      {/* ---------- table ---------- */}
      <Table
        className="min-w-max"
        containerClassName="always-visible-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-auto bg-background pr-3 pb-0"
      >
        <TableHeader className="bg-white sticky top-0 z-40">
          <TableRow>
            <TableHead className="sticky left-0 z-[30] bg-white w-10">💼</TableHead>
            <TableHead className="sticky left-10 z-[30] bg-white min-w-[180px]">Контрагент</TableHead>
            <TableHead className="sticky left-[250px] z-[30] bg-white min-w-[100px] text-right">Остаток</TableHead>
            <TableHead className="sticky left-[370px] z-[30] bg-white min-w-[100px] text-right">Не оплачено</TableHead>
            {formattedDateRange.map((d) => (
              <TableHead key={d}>{d}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Object.entries(groupedByEntity)
            .sort(([a], [b]) => (entityOrderMap.get(+a) ?? 0) - (entityOrderMap.get(+b) ?? 0))
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
                onToggleVisibilityRequest={(partnerId, shortName) =>
                  handleToggleVisibilityRequest(partnerId, shortName, +entityId)
                }
                canUseQuickPayment={canUseQuickPayment}
              />
            ))}
        </TableBody>
      </Table>

      {/* ---------- модалки ---------- */}
      {modalOpen && canSeeDetailsModal && (
        <PaymentDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
          title={modalTitle}
          paymentDetails={modalPaymentDetails}
          reloadDocuments={reloadDocuments} // 👈 главное изменение
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

      {/* ---------- bottom panel ---------- */}
      {canUseBottomPanel && (
        <PaymentBottomPanel
          pendingPayments={pendingPayments}
          overallTotal={overallTotal}
          onFinalize={finalizePayments}
          onGroupedFinalize={finalizeGroupedPayments}
          onPay={onPay}
        />
      )}

      {/* ---------- confirm dialog ---------- */}
      {confirmDialogOpen && pendingVisibilityPartnerId !== null && pendingEntityId !== null && (
        <ChoiceDialog
          open={confirmDialogOpen}
          title="Скрыть контрагента?"
          description={`Контрагент ${pendingPartnerShortName} будет скрыт из таблицы, но не удалён из системы.`}
          choices={[
            {
              label: "Скрыть",
              onSelect: async () => {
                setConfirmDialogOpen(false);
                await handleToggleVisibility(pendingVisibilityPartnerId, false, pendingEntityId);
                setPendingVisibilityPartnerId(null);
                setPendingEntityId(null);
              },
            },
          ]}
          onCancel={() => {
            setConfirmDialogOpen(false);
            setPendingVisibilityPartnerId(null);
            setPendingEntityId(null);
          }}
        />
      )}
    </div>
  );
};
