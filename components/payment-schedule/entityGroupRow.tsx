"use client";

import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import {
  DocumentType,
  PaymentEntry,
  PaymentDetail,
  PartnerType,
} from "../../types/types";
import {
  getColorForEntity,
  isSameDay,
  getDisplayDate,
  formatMoney,
} from "../../lib/helpers";
import { cn } from "@/lib/utils";
import { usePendingPayments } from "@/lib/hooks/usePendingPayments";

type EntityGroupRowProps = {
  entityId: number;
  rows: { partner: PartnerType; documents: DocumentType[] }[];
  dateRange: Date[];
  entityNames: Record<number, string>;
  pendingPayments: PaymentDetail[];
  onCellClick: (entries: PaymentEntry[]) => void;
  onPartnerClick: (partner: PartnerType, documents: DocumentType[]) => void;
};

export const EntityGroupRow: React.FC<EntityGroupRowProps> = ({
  entityId,
  rows,
  dateRange,
  entityNames,
  pendingPayments,
  onCellClick,
  onPartnerClick,
}) => {
  const { update, setPendingPayments } = usePendingPayments();

  const renderRows = rows.map((row, rowIndex) => {
    const { partner, documents } = row;
    const unpaidEntries: PaymentEntry[] = [];
    const paidEntries: PaymentEntry[] = [];

    const color = getColorForEntity(entityId);

    documents.forEach((doc) => {
      doc.spec_doc.forEach((spec) => {
        const isExpected = !!spec.expected_date;
        const entry = { spec_doc: spec, document: doc, isExpected };
        spec.is_paid ? paidEntries.push(entry) : unpaidEntries.push(entry);
      });
    });

    const totalRemaining = documents.reduce((acc, doc) => {
      const totalAccount = Number(doc.account_sum);
      const totalSpec = doc.spec_doc.reduce(
        (s, spec) => s + Number(spec.pay_sum),
        0
      );
      return acc + totalAccount - totalSpec;
    }, 0);

    return (
      <TableRow key={partner.id} className={cn("group", color)}>
        {rowIndex === 0 && (
          <TableCell
            rowSpan={rows.length}
            className={`sticky left-0 top-[-50] z-[20] w-[30px] border-r ${color}`}
          >
            <div
              className="font-bold text-center rotate-180
            [writing-mode:vertical-rl] [-webkit-writing-mode:vertical-rl]"
            >
              {entityNames[entityId]}
            </div>
          </TableCell>
        )}

        <TableCell
          className={`sticky left-10 z-[10] w-[180px] ${color} transition-colors group-hover:bg-muted/50`}
        >
          <button
            className="text-blue-500 hover:underline"
            onClick={() => onPartnerClick(partner, documents)}
          >
            {partner.short_name}
          </button>
        </TableCell>

        <TableCell
          className={`sticky left-[220px] z-[10] w-[120px] ${color} transition-colors group-hover:bg-muted/50`}
        >
          {formatMoney(totalRemaining)}
        </TableCell>

        {dateRange.map((date, idx) => {
          const cellUnpaid = unpaidEntries.filter((e) =>
            isSameDay(date, getDisplayDate(e.spec_doc))
          );
          const cellPaid = paidEntries.filter((e) =>
            isSameDay(date, getDisplayDate(e.spec_doc))
          );
          const cellAll = [...cellUnpaid, ...cellPaid];

          const specDocIds = cellUnpaid.map((e) => e.spec_doc.id);
          const hasPendingInCell = specDocIds.every((id) =>
            pendingPayments.some((p) => p.spec_doc_id === id)
          );

          const pendingSum = cellAll
            .filter((e) =>
              pendingPayments.some((p) => p.spec_doc_id === e.spec_doc.id)
            )
            .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);

          const expectedSum = cellUnpaid
            .filter(
              (e) =>
                e.spec_doc.expected_date &&
                !pendingPayments.some((p) => p.spec_doc_id === e.spec_doc.id)
            )
            .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);

          const deadlineSum = cellUnpaid
            .filter(
              (e) =>
                !e.spec_doc.expected_date &&
                !pendingPayments.some((p) => p.spec_doc_id === e.spec_doc.id)
            )
            .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);

          const confirmedSum = cellPaid
            .filter(
              (e) =>
                !pendingPayments.some((p) => p.spec_doc_id === e.spec_doc.id)
            )
            .reduce((s, e) => s + Number(e.spec_doc.pay_sum), 0);

          return (
            <TableCell
              key={idx}
              onClick={(e) => {
                if (cellUnpaid.length === 0) return;

                const specDocIds = cellUnpaid.map((e) => e.spec_doc.id);
                const hasAllPending = specDocIds.every((id) =>
                  pendingPayments.some((p) => p.spec_doc_id === id)
                );

                if (e.ctrlKey || e.metaKey) {
                  if (hasAllPending) {
                    const remaining = pendingPayments.filter(
                      (p) => !specDocIds.includes(p.spec_doc_id)
                    );
                    setPendingPayments(remaining);
                  } else {
                    const newDetails: PaymentDetail[] = cellUnpaid.map(
                      (entry) => ({
                        doc_id: entry.document.id,
                        entity_id: entry.document.entity_id,
                        spec_doc_id: entry.spec_doc.id,
                        partner_id: entry.document.partner_id,
                        partner_name: entry.document.partner.full_name,
                        partner_entity_id: entry.document.entity_id,

                        partner_account_mfo:
                          entry.document.partner_account_number.mfo ??
                          undefined,
                        partner_account_number:
                          entry.document.partner_account_number.bank_account,
                        partner_account_bank_name:
                          entry.document.partner_account_number.bank_name ??
                          undefined,
                        account_number: entry.document.account_number,
                        purpose_of_payment: entry.document.purpose_of_payment,
                        dead_line_date: entry.spec_doc.dead_line_date,
                        date: entry.document.date,
                        pay_sum: Number(entry.spec_doc.pay_sum),
                      })
                    );

                    update(newDetails, []);
                  }
                } else {
                  onCellClick(cellUnpaid);
                }
              }}
              className="cursor-pointer"
            >
              <div className="flex flex-col items-start">
                {expectedSum + deadlineSum > 0 && (
                  <span className="text-red-500">
                    {formatMoney(expectedSum + deadlineSum)}
                  </span>
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
  });

  return <>{renderRows}</>;
};
