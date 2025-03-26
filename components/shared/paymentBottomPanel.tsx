"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { PaymentDetail } from "../../types";
import { usePaymentStore } from "../../store/store";

type GroupedPayments = Record<number, { name: string; total: number }>;

type PaymentBottomPanelProps = {
  pendingPayments: PaymentDetail[];
  groupedPayments: GroupedPayments;
  overallTotal: number;
  onFinalize: () => void;
};

export const PaymentBottomPanel: React.FC<PaymentBottomPanelProps> = ({
  pendingPayments,
  groupedPayments,
  overallTotal,
  onFinalize,
}) => {
  const isExpanded = usePaymentStore((state) => state.isPaymentPanelExpanded);
  const expandPanel = usePaymentStore((state) => state.expandPaymentPanel);
  const collapsePanel = usePaymentStore((state) => state.collapsePaymentPanel);

  if (pendingPayments.length === 0) return null;

  return (
    <>
      {isExpanded ? (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-200 p-4 pl-20 pr-20">
          <div className="flex justify-end mb-2 font-bold text-lg">
            Общая сумма: {overallTotal}
          </div>
          {/* <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Контрагент</TableHead>
                <TableHead>Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(groupedPayments).map((partner) => (
                <TableRow key={partner.name}>
                  <TableCell>{partner.name}</TableCell>
                  <TableCell>{partner.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> */}
          <div className="flex justify-end items-center space-x-2 mt-2">
            <Button onClick={onFinalize}>Сформировать</Button>
            <Button onClick={onFinalize}>Сформировать</Button>
            <Button variant="secondary" onClick={collapsePanel}>
              Скрыть
            </Button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-4 right-4">
          <Button onClick={expandPanel}>Показать панель</Button>
        </div>
      )}
    </>
  );
};
