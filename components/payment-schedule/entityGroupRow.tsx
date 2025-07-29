"use client";

import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui";
import { EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/lib/hooks/use-toast";
import {
  getColorForEntity,
  isSameDay,
  getDisplayDate,
  formatMoney,
} from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { usePendingPayments } from "@/lib/hooks/usePendingPayments";
import { createPaymentDetail } from "@/lib/transformData/paymentDetail";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Roles } from "@/constants/roles";
import type {
  PartnerType,
  DocumentType,
  PaymentEntry,
  PaymentDetail,
} from "@/types/types";

export type EntityGroupRowProps = {
  entityId: number;
  rows: { partner: PartnerType; documents: DocumentType[] }[];
  dateRange: Date[];
  entityNames: Record<number, string>;
  pendingPayments: PaymentDetail[];
  canUseQuickPayment: boolean;
  onCellClick: (entries: PaymentEntry[]) => void;
  onPartnerClick: (partner: PartnerType, documents: DocumentType[]) => void;
  onToggleVisibilityRequest: (partnerId: number, shortName: string) => void;
};

export const EntityGroupRow: React.FC<EntityGroupRowProps> = ({
  entityId,
  rows,
  dateRange,
  entityNames,
  pendingPayments,
  canUseQuickPayment,
  onCellClick,
  onPartnerClick,
  onToggleVisibilityRequest,
}) => {
  const { update, setPendingPayments } = usePendingPayments();
  const { canAccess } = useAccessControl();
  const isAdmin = canAccess(Roles.ADMIN);

  const [contextOpen, setContextOpen] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const [contextPartner, setContextPartner] = useState<{
    id: number;
    documents: DocumentType[];
  } | null>(null);

  const renderRows = rows.map((row, rowIndex) => {
    const { partner, documents } = row;

    const unpaidEntries: PaymentEntry[] = [];
    const paidEntries: PaymentEntry[] = [];

    documents.forEach((doc) =>
      doc.spec_doc.forEach((spec) => {
        const entry = {
          spec_doc: spec,
          document: doc,
          isExpected: !!spec.expected_date,
        };
        (spec.is_paid ? paidEntries : unpaidEntries).push(entry);
      })
    );

    const totalRemaining = documents.reduce((acc, doc) => {
      const totalAccount = +doc.account_sum;
      const totalSpecSum = doc.spec_doc.reduce(
        (s, spec) => s + +spec.pay_sum,
        0
      );
      return acc + totalAccount - totalSpecSum;
    }, 0);

    const totalUnpaid = unpaidEntries.reduce(
      (sum, e) => sum + +e.spec_doc.pay_sum,
      0
    );

    const color = getColorForEntity(entityId);
    const pendingIds = new Set(pendingPayments.map((p) => p.spec_doc_id));

    return (
      <TableRow
        key={partner.id}
        className={cn("group", color)}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextPos({ x: e.clientX, y: e.clientY });
          setContextPartner({ id: partner.id, documents });
          setContextOpen(true);
        }}
      >
        {rowIndex === 0 && (
          <TableCell
            rowSpan={rows.length}
            className={`sticky left-0 z-[20] w-[30px] border-r top-[-50px] ${color}`}
          >
            <div className="font-bold rotate-180 text-center [writing-mode:vertical-rl] [-webkit-writing-mode:vertical-rl]">
              {entityNames[entityId]}
            </div>
          </TableCell>
        )}

        <TableCell
          className={`sticky left-10 z-[10] w-[210px] ${color} transition-colors group-hover:bg-muted/50`}
        >
          <button
            className="text-blue-500 hover:underline"
            onClick={() => onPartnerClick(partner, documents)}
          >
            {partner.short_name}
          </button>
        </TableCell>

        <TableCell
          className={`sticky left-[210px] z-[10] w-[120px] ${color} text-right transition-colors group-hover:bg-muted/50`}
        >
          {formatMoney(totalRemaining)
            } {/* Total remaining in account */}
        </TableCell>

        <TableCell
          className={`sticky left-[310px] z-[10] w-[120px] ${color} text-right transition-colors group-hover:bg-muted/50`}
        >
          {totalUnpaid > 0 ? (
            <span className="text-red-500">{formatMoney(totalUnpaid)}</span>
          ) : (
              <span>{formatMoney(totalUnpaid)}</span>
          )}

        </TableCell>

        {dateRange.map((date, idx) => {
          const cellUnpaid = unpaidEntries.filter((e) =>
            isSameDay(date, getDisplayDate(e.spec_doc))
          );
          const cellPaid = paidEntries.filter((e) =>
            isSameDay(date, getDisplayDate(e.spec_doc))
          );

          const expectedSum = cellUnpaid
            .filter(
              (e) => e.spec_doc.expected_date && !pendingIds.has(e.spec_doc.id)
            )
            .reduce((s, e) => s + +e.spec_doc.pay_sum, 0);

          const deadlineSum = cellUnpaid
            .filter(
              (e) => !e.spec_doc.expected_date && !pendingIds.has(e.spec_doc.id)
            )
            .reduce((s, e) => s + +e.spec_doc.pay_sum, 0);

          const pendingSum = [...cellUnpaid, ...cellPaid]
            .filter((e) => pendingIds.has(e.spec_doc.id))
            .reduce((s, e) => s + +e.spec_doc.pay_sum, 0);

          const confirmedSum = cellPaid
            .filter((e) => !pendingIds.has(e.spec_doc.id))
            .reduce((s, e) => s + +e.spec_doc.pay_sum, 0);

          return (
            <TableCell
              key={idx}
              onClick={(e) => {
                const specDocIds = cellUnpaid.map((e) => e.spec_doc.id);
                const hasAllPending = specDocIds.every((id) =>
                  pendingIds.has(id)
                );

                if (e.ctrlKey || e.metaKey) {
                  if (!canUseQuickPayment || cellUnpaid.length === 0) return;

                  if (hasAllPending) {
                    setPendingPayments(
                      pendingPayments.filter(
                        (p) => !specDocIds.includes(p.spec_doc_id)
                      )
                    );
                  } else {
                    update(cellUnpaid.map(createPaymentDetail), []);
                  }
                } else {
                  // обычный клик — ADMIN видит всё (unpaid + paid), остальные — только unpaid
                  const entries = isAdmin
                    ? [...cellUnpaid, ...cellPaid]
                    : [...cellUnpaid];
                  if (entries.length === 0) return;
                  onCellClick(entries);
                }
              }}
              className="cursor-pointer"
            >
              <div className="flex flex-col items-end">
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

  return (
    <>
      {renderRows}
      {contextOpen && contextPartner && (
        <DropdownMenu open onOpenChange={setContextOpen}>
          <DropdownMenuContent
            side="right"
            align="start"
            style={{
              position: "fixed",
              top: contextPos.y,
              left: contextPos.x,
              zIndex: 1000,
            }}
          >
            <DropdownMenuItem
              onClick={() => {
                const hasUnpaid = contextPartner.documents.some((doc) =>
                  doc.spec_doc.some((spec) => !spec.is_paid)
                );
                if (hasUnpaid) {
                  toast.error("Нельзя скрыть: есть неоплаченные документы");
                  setContextOpen(false);
                  return;
                }
                onToggleVisibilityRequest(
                  contextPartner.id,
                  contextPartner.documents[0].partner.short_name
                );
                setContextOpen(false);
              }}
              className="gap-2 text-red-500"
            >
              <EyeOff size={14} />
              Скрыть
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};
