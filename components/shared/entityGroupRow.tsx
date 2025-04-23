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
  const renderRows = rows.map((row, rowIndex) => {
    const { partner, documents } = row;
    const unpaidEntries: PaymentEntry[] = [];
    const paidEntries: PaymentEntry[] = [];

    const color = getColorForEntity(partner.entity_id);

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
        {/* 💼 Юрлицо — sticky по вертикали и горизонтали */}
        {rowIndex === 0 && (
          <TableCell
            rowSpan={rows.length}
            className={`sticky left-0 top-0 z-[20] w-[30px] border-r ${color} `}
          >
            <div
              className="font-bold text-2xl text-center rotate-180
            [writing-mode:vertical-rl] [-webkit-writing-mode:vertical-rl]"
            >
              {entityNames[entityId]}
            </div>
          </TableCell>
        )}

        {/* Контрагент — sticky слева */}
        <TableCell
          className={`sticky left-10 z-[10] w-[180px] ${color} transition-colors group-hover:bg-muted/50`}
        >
          <button
            className="text-blue-500 hover:underline"
            onClick={() => onPartnerClick(partner, documents)}
          >
            {partner.name}
          </button>
        </TableCell>

        {/* Остаток — тоже sticky */}
        <TableCell
          className={`sticky left-[220px] z-[10]  w-[120px] ${color} transition-colors group-hover:bg-muted/50`}
        >
          {formatMoney(totalRemaining)}
        </TableCell>

        {/* Динамические ячейки по датам */}
        {dateRange.map((date, idx) => {
          const cellUnpaid = unpaidEntries.filter((e) =>
            isSameDay(date, getDisplayDate(e.spec_doc))
          );
          const cellPaid = paidEntries.filter((e) =>
            isSameDay(date, getDisplayDate(e.spec_doc))
          );
          const cellAll = [...cellUnpaid, ...cellPaid];

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
              onClick={() => cellUnpaid.length > 0 && onCellClick(cellUnpaid)}
            >
              <div className="flex flex-col items-start ">
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
