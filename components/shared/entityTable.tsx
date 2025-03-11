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

export type EntityTableProps = {
  documents: DocumentType[];
};

const isSameDay = (date1: Date, date2: Date): boolean =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

export const EntityTable = ({ documents }: EntityTableProps) => {
  console.log("documents", documents);
  const [localDocs, setLocalDocs] = useState<DocumentType[]>(documents);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [period, setPeriod] = useState<number>(7); // новое состояние для периода
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalPaymentDetails, setModalPaymentDetails] = useState<
    PaymentDetail[]
  >([]);
  const [showBottomPanel, setShowBottomPanel] = useState<boolean>(false);

  const [partnerModalOpen, setPartnerModalOpen] = useState<boolean>(false);
  const [selectedPartner, setSelectedPartner] = useState<
    DocumentType["partners"] | null
  >(null);
  const [selectedPartnerDocuments, setSelectedPartnerDocuments] = useState<
    DocumentType[]
  >([]);

  const today = new Date();

  // Используем выбранное значение периода для генерации диапазона дат
  const dateRange = Array.from({ length: period }).map((_, index) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + index);
    return d;
  });

  const partnersMap = localDocs.reduce((acc, doc) => {
    const partnerId = doc.partners.id;
    if (!acc[partnerId]) {
      acc[partnerId] = { partner: doc.partners, documents: [doc] };
    } else {
      acc[partnerId].documents.push(doc);
    }
    return acc;
  }, {} as Record<number, { partner: DocumentType["partners"]; documents: DocumentType[] }>);

  const partnerRows = Object.values(partnersMap);

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
        date: entry.document.date,
        pay_sum: entry.spec_doc.pay_sum,
      }));
      setModalPaymentDetails(paymentDetails);
      setModalTitle(
        `Документы для партнёра ${cellUnpaid[0].document.partners.name}`
      );
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
    setShowBottomPanel((prev) => (prev ? updatedPayments.length > 0 : prev));
    setModalOpen(false);
  };

  const finalizePayments = () => {
    const pendingPayments = usePaymentStore.getState().pendingPayments

    const updatedDocs = localDocs.map((doc) => {
      let updated = false;
      const updatedSpecDocs = doc.spec_doc.map((spec) => {
        const shouldMark = pendingPayments.some(
          (detail) =>
            detail.spec_doc_id === spec.id &&
            detail.partner_id === doc.partner_id
        );
        if (shouldMark) {
          updated = true;
          return { ...spec, is_paid: true };
        }
        return spec;
      });
      if (updated) {
        return { ...doc, spec_doc: updatedSpecDocs };
      }
      return doc;

    });
    const toUpdate = pendingPayments.map((payment) => payment.spec_doc_id);
    console.log('toUpdate',toUpdate)

    apiClient.specDoc.updatePaymentsById({
      specDocIds: toUpdate,
    });

    setLocalDocs(updatedDocs);
    usePaymentStore.getState().clearPendingPayments();
    setShowBottomPanel(false);


  };

  const groupPendingPayments = (payments: PaymentDetail[]) => {
    return payments.reduce((acc, payment) => {
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
  };

  const pendingPayments = usePaymentStore.getState().pendingPayments;
  const groupedPayments = groupPendingPayments(pendingPayments);
  const overallTotal = pendingPayments.reduce(
    (acc, payment) => acc + Number(payment.pay_sum),
    0
  );

  return (
    <div className="p-4">
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
        {/* Новая группа кнопок для выбора периода */}
        <div className="flex  justify-start items-start space-x-2">
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
        </div>
        <div className="text-sm text-gray-600">
          {dateRange[0].toLocaleDateString()} -{" "}
          {dateRange[period - 1].toLocaleDateString()}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Контрагент</TableHead>
            <TableHead>Сумма</TableHead>
            {dateRange.map((date, index) => (
              <TableHead key={index}>{date.toLocaleDateString()}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {partnerRows.map(({ partner, documents }) => {
            const unpaidEntries: PaymentEntry[] = [];
            const paidEntries: PaymentEntry[] = [];

            documents.forEach((doc) => {
              doc.spec_doc.forEach((spec) => {
                const expectedDate = new Date(spec.expected_date);
                let type: "expected" | "deadline" = "expected";
                if (today > expectedDate) {
                  type = "deadline";
                }
                if (spec.is_paid) {
                  paidEntries.push({ spec_doc: spec, document: doc, type });
                } else {
                  unpaidEntries.push({ spec_doc: spec, document: doc, type });
                }
              });
            });

            const totalUnpaid = unpaidEntries.reduce(
              (sum, entry) => sum + Number(entry.spec_doc.pay_sum),
              0
            );

            return (
              <TableRow key={partner.id}>
                <TableCell>
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => handlePartnerNameClick(partner, documents)}
                  >
                    {partner.name}
                  </button>
                </TableCell>
                <TableCell>{totalUnpaid}</TableCell>
                {dateRange.map((date, index) => {
                  const cellUnpaid = unpaidEntries.filter((entry) =>
                    isSameDay(
                      date,
                      entry.type === "expected"
                        ? new Date(entry.spec_doc.expected_date)
                        : new Date(entry.spec_doc.dead_line_date)
                    )
                  );
                  const cellPaid = paidEntries.filter((entry) =>
                    isSameDay(
                      date,
                      entry.type === "expected"
                        ? new Date(entry.spec_doc.expected_date)
                        : new Date(entry.spec_doc.dead_line_date)
                    )
                  );
                  const sumExpected = cellUnpaid
                    .filter((e) => e.type === "expected")
                    .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);
                  const sumDeadline = cellUnpaid
                    .filter((e) => e.type === "deadline")
                    .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);
                  const sumPaid = cellPaid.reduce(
                    (s, e) => s + Number(e.spec_doc.pay_sum),
                    0
                  );

                  return (
                    <TableCell
                      key={index}
                      onClick={() =>
                        cellUnpaid.length > 0 && handleCellClick(cellUnpaid)
                      }
                    >
                      <div className="flex flex-col items-center">
                        {sumExpected > 0 && (
                          <span className="text-red-500">{sumExpected}</span>
                        )}
                        {sumDeadline > 0 && (
                          <span className="text-red-600 font-bold">{sumDeadline}</span>
                        )}
                        {sumPaid > 0 && (
                          <span className="text-green-500">{sumPaid}</span>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
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
