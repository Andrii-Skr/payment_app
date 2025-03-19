"use client";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PaymentDetailsModal } from "./paymentDetailsModal";
import { PartnerDocumentsModal } from "./partnerDocumentsModal";
import { DocumentType, PaymentEntry, PaymentDetail } from "../../types";
import { usePaymentStore } from "../../store/store";
import { PaymentBottomPanel } from "./paymentBottomPanel";
import { apiClient } from "@/services/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const isSameDay = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const getDisplayDate = (spec: {
  expected_date?: string;
  dead_line_date?: string;
}) =>
  spec.expected_date
    ? new Date(spec.expected_date)
    : new Date(spec.dead_line_date!);

const formatMoney = (value: number): string => value.toFixed(2);

const colors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-red-100",
  "bg-purple-100",
  "bg-indigo-100",
];
const getColorForEntity = (entityId: number) =>
  colors[entityId % colors.length];

const totalRemainingForPartner = (docs: DocumentType[]) => {
  const totalAccount = docs.reduce(
    (sum, doc) => sum + Number(doc.account_sum),
    0
  );
  const totalSpecDoc = docs.reduce((sum, doc) => {
    return (
      sum + doc.spec_doc.reduce((acc, spec) => acc + Number(spec.pay_sum), 0)
    );
  }, 0);
  return totalAccount - totalSpecDoc;
};

export type EntityTableProps = {
  documents: DocumentType[];
  entityNames: Record<number, string>;
};

export const EntityTable = ({ documents, entityNames }: EntityTableProps) => {

  // Управление датами и периодом
  const initialDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Kyiv" })
  );
  const [startDate, setStartDate] = useState<Date>(initialDate);
  const [period, setPeriod] = useState<number>(7);

  // Модальные окна и платежи
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalPaymentDetails, setModalPaymentDetails] = useState<PaymentDetail[]>([]);
  const [showBottomPanel, setShowBottomPanel] = useState<boolean>(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<DocumentType["partners"] | null>(null);
  const [selectedPartnerDocuments, setSelectedPartnerDocuments] = useState<DocumentType[]>([]);

  // Новые состояния для фильтров
  const [selectedEntity, setSelectedEntity] = useState<number | "all">("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("");

  const pendingPayments = usePaymentStore((state) => state.pendingPayments);

  const dateRange = Array.from({ length: period }).map((_, index) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + index);
    return d;
  });

  // Группируем документы по контрагентам
  const partnersMap = documents.reduce((acc, doc) => {
    const partnerId = doc.partners.id;
    if (!acc[partnerId]) {
      acc[partnerId] = { partner: doc.partners, documents: [doc] };
    } else {
      acc[partnerId].documents.push(doc);
    }
    return acc;
  }, {} as Record<number, { partner: DocumentType["partners"]; documents: DocumentType[] }>);

  let partnerRows = Object.values(partnersMap);
  partnerRows.sort((a, b) => {
    const diff = a.partner.entity_id - b.partner.entity_id;
    if (diff !== 0) return diff;
    return a.partner.name.localeCompare(b.partner.name);
  });

  // Применяем фильтрацию по выбранному entity
  if (selectedEntity !== "all") {
    partnerRows = partnerRows.filter(row => row.partner.entity_id === selectedEntity);
  }
  // Фильтрация по имени партнёра
  if (partnerFilter) {
    partnerRows = partnerRows.filter(row =>
      row.partner.name.toLowerCase().includes(partnerFilter.toLowerCase())
    );
  }

  // Группируем отфильтрованные строки по entity
  const groupedByEntity = partnerRows.reduce((acc, row) => {
    const entityId = row.partner.entity_id;
    if (!acc[entityId]) {
      acc[entityId] = [];
    }
    acc[entityId].push(row);
    return acc;
  }, {} as Record<number, typeof partnerRows>);

  const handlePrev = () => {
    setStartDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNext = () => {
    setStartDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleCellClick = (cellUnpaid: PaymentEntry[]) => {
    if (cellUnpaid.length > 0) {
      const paymentDetails: PaymentDetail[] = cellUnpaid.map((entry) => ({
        spec_doc_id: entry.spec_doc.id,
        partner_id: entry.document.partner_id,
        partner_name: entry.document.partners.name,
        account_number: entry.document.account_number,
        note: entry.document.note,
        date: entry.document.date,
        pay_sum: entry.spec_doc.pay_sum,
      }));
      setModalPaymentDetails(paymentDetails);
      setModalTitle(`Документы для партнёра ${cellUnpaid[0].document.partners.name}`);
      setModalOpen(true);
    }
  };

  const handlePartnerNameClick = (
    partner: DocumentType["partners"],
    documents: DocumentType[]
  ) => {
    setSelectedPartner(partner);
    setSelectedPartnerDocuments(documents);
    setPartnerModalOpen(true);
  };

  const handleModalSave = (selectedDetails: PaymentDetail[]) => {
    const currentBatchIds = modalPaymentDetails.map(
      (detail) => detail.spec_doc_id
    );
    const currentPending = usePaymentStore.getState().pendingPayments;
    const filtered = currentPending.filter(
      (p) => !currentBatchIds.includes(p.spec_doc_id)
    );
    const updatedPayments = [...filtered, ...selectedDetails];
    usePaymentStore.getState().setPendingPayments(updatedPayments);
    setShowBottomPanel(updatedPayments.length > 0);
    setModalOpen(false);
  };

  const finalizePayments = () => {
    const pendingPayments = usePaymentStore.getState().pendingPayments;
    documents.map((doc) => {
      doc.spec_doc = doc.spec_doc.map((spec) => {
        const shouldMark = pendingPayments.some(
          (detail) =>
            detail.spec_doc_id === spec.id &&
            detail.partner_id === doc.partner_id
        );
        if (shouldMark) {
          return { ...spec, is_paid: true };
        }
        return spec;
      });
      return doc;
    });
    const toUpdate = pendingPayments.map((payment) => payment.spec_doc_id);
    apiClient.specDoc.updatePaymentsById({
      specDocIds: toUpdate,
    });
    usePaymentStore.getState().clearPendingPayments();
    setShowBottomPanel(false);
  };

  const groupPendingPayments = (payments: PaymentDetail[]) =>
    payments.reduce((acc, payment) => {
      if (!acc[payment.partner_id]) {
        acc[payment.partner_id] = {
          name: payment.partner_name,
          total: Number(payment.pay_sum),
        };
      } else {
        acc[payment.partner_id].total += Number(payment.pay_sum);
      }
      return acc;
    }, {} as Record<number, { name: string; total: number }>);
  const groupedPayments = groupPendingPayments(pendingPayments);
  const overallTotal = pendingPayments.reduce(
    (acc, payment) => acc + Number(payment.pay_sum),
    0
  );

  return (
    <div className="">
      <div className="flex items-center justify-start mb-4 gap-5">
        <div className="flex items-center space-x-2">
          <Button onClick={handlePrev}>←</Button>
          <input
            type="date"
            value={startDate.toISOString().split("T")[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="border rounded p-1"
          />
          <Button onClick={handleNext}>→</Button>
        </div>
        <div className="flex justify-start items-center space-x-2">
          <Button
            variant={period === 7 ? "secondary" : "default"}
            onClick={() => setPeriod(7)}
          >
            7 дней
          </Button>
          <Button
            variant={period === 14 ? "secondary" : "default"}
            onClick={() => setPeriod(14)}
          >
            14 дней
          </Button>
          <Button
            variant={period === 30 ? "secondary" : "default"}
            onClick={() => setPeriod(30)}
          >
            Месяц
          </Button>
          {/* Фильтры добавлены после кнопки "Месяц" */}
          <Select
            value={selectedEntity === "all" ? "all" : selectedEntity.toString()}
            onValueChange={(value) =>
              setSelectedEntity(value === "all" ? "all" : Number(value))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все ЮрЛица" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ЮрЛица</SelectItem>
              {Object.entries(entityNames).map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="text"
            placeholder="Фильтр по Контрагенту"
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <div className="text-sm text-gray-600">
          {dateRange[0].toLocaleDateString("ru-RU", { timeZone: "Europe/Kyiv" })} -{" "}
          {dateRange[period - 1].toLocaleDateString("ru-RU", { timeZone: "Europe/Kyiv" })}
        </div>
      </div>

      {/* Таблица с данными */}
      <Table containerClassName="overflow-y-auto max-h-[87vh]">
        <TableHeader className="bg-white sticky top-0 z-10">
          <TableRow>
            <TableHead className="sticky top-0 bg-white z-10">💼</TableHead>
            <TableHead className="sticky top-0 bg-white z-10">Контрагент</TableHead>
            <TableHead className="sticky top-0 bg-white z-10">Остаток</TableHead>
            {dateRange.map((date, index) => (
              <TableHead key={index} className="sticky top-0 bg-white z-10">
                {date.toLocaleDateString("ru-RU", { timeZone: "Europe/Kyiv" })}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedByEntity)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([entityId, groupRows]) =>
              groupRows.map((row, rowIndex) => {
                const { partner, documents } = row;
                const totalRemaining = totalRemainingForPartner(documents);
                const unpaidEntries: PaymentEntry[] = [];
                const paidEntries: PaymentEntry[] = [];

                documents.forEach((doc) => {
                  doc.spec_doc.forEach((spec) => {
                    const displayDate = spec.expected_date
                      ? new Date(spec.expected_date)
                      : spec.dead_line_date
                      ? new Date(spec.dead_line_date)
                      : undefined;
                    const isExpected = !!spec.expected_date;
                    if (spec.is_paid) {
                      paidEntries.push({
                        spec_doc: spec,
                        document: doc,
                        isExpected,
                      });
                    } else {
                      unpaidEntries.push({
                        spec_doc: spec,
                        document: doc,
                        isExpected,
                      });
                    }
                  });
                });

                return (
                  <TableRow
                    key={partner.id}
                    className={`${getColorForEntity(
                      partner.entity_id
                    )} hover:bg-gray-100`}
                  >
                    {rowIndex === 0 && (
                      <TableCell
                        rowSpan={groupRows.length}
                        className="align-middle w-2"
                      >
                        <div
                          className="font-bold text-2xl"
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                          }}
                        >
                          {entityNames[Number(entityId)]}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() =>
                          handlePartnerNameClick(partner, documents)
                        }
                      >
                        {partner.name}
                      </button>
                    </TableCell>
                    <TableCell>{formatMoney(totalRemaining)}</TableCell>
                    {dateRange.map((date, index) => {
                      const cellUnpaid = unpaidEntries.filter((entry) =>
                        isSameDay(date, getDisplayDate(entry.spec_doc))
                      );
                      const cellPaid = paidEntries.filter((entry) =>
                        isSameDay(date, getDisplayDate(entry.spec_doc))
                      );
                      const cellAll = [...cellUnpaid, ...cellPaid];

                      const pendingSum = cellAll
                        .filter((entry) =>
                          pendingPayments.some(
                            (p) => p.spec_doc_id === entry.spec_doc.id
                          )
                        )
                        .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);

                      const expectedSum = cellUnpaid
                        .filter(
                          (e) =>
                            e.spec_doc.expected_date &&
                            !pendingPayments.some(
                              (p) => p.spec_doc_id === e.spec_doc.id
                            )
                        )
                        .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);
                      const deadlineSum = cellUnpaid
                        .filter(
                          (e) =>
                            !e.spec_doc.expected_date &&
                            !pendingPayments.some(
                              (p) => p.spec_doc_id === e.spec_doc.id
                            )
                        )
                        .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);

                      const confirmedSum = cellPaid
                        .filter(
                          (entry) =>
                            !pendingPayments.some(
                              (p) => p.spec_doc_id === entry.spec_doc.id
                            )
                        )
                        .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);

                      return (
                        <TableCell
                          key={index}
                          onClick={() =>
                            cellUnpaid.length > 0 && handleCellClick(cellUnpaid)
                          }
                        >
                          <div className="flex flex-col items-center">
                            {expectedSum > 0 && (
                              <span className="text-red-500">
                                {formatMoney(expectedSum)}
                              </span>
                            )}
                            {deadlineSum > 0 && (
                              <div>
                                <div className="text-red-600 font-bold">
                                  {formatMoney(deadlineSum)}
                                </div>
                              </div>
                            )}
                            {pendingSum > 0 && (
                              <span className="text-blue-500">
                                {formatMoney(pendingSum)}
                              </span>
                            )}
                            {confirmedSum > 0 && (
                              <span className="text-green-500">
                                {formatMoney(confirmedSum)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
        </TableBody>
      </Table>

      {modalOpen && (
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

      <PaymentBottomPanel
        pendingPayments={pendingPayments}
        groupedPayments={groupedPayments}
        overallTotal={overallTotal}
        onFinalize={finalizePayments}
      />
    </div>
  );
};
