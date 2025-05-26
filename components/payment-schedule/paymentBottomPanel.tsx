"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChoiceDialog } from "@/components/ui/choice-dialog";
import { PaymentDetail } from "@/types/types";
import { usePaymentStore } from "@/store/store";

type GroupedPayments = Record<number, { name: string; total: number }>;

type PaymentBottomPanelProps = {
  pendingPayments: PaymentDetail[];
  groupedPayments: GroupedPayments;
  overallTotal: number;
  onFinalize: () => void;
  onGroupedFinalize: () => void;
  onPay: () => void;
};

export const PaymentBottomPanel: React.FC<PaymentBottomPanelProps> = ({
  pendingPayments,
  groupedPayments,
  overallTotal,
  onFinalize,
  onGroupedFinalize,
  onPay,
}) => {
  const isExpanded = usePaymentStore((s) => s.isPaymentPanelExpanded);
  const expandPanel = usePaymentStore((s) => s.expandPaymentPanel);
  const collapsePanel = usePaymentStore((s) => s.collapsePaymentPanel);

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);

console.log("Pending Payments:", pendingPayments);

  if (pendingPayments.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-4 right-8 bg-[rgba(229,231,235,0.7)] p-4 pl-20 pr-20 z-50 shadow-lg"
          >
            <div className="flex justify-end mb-2 font-bold text-lg">
              Общая сумма:{" "}
              {overallTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
            </div>
            <div className="flex justify-end items-center space-x-2 mt-2">
              <Button onClick={() => setPayDialogOpen(true)}>Оплатить</Button>
              <Button onClick={() => setFinalizeDialogOpen(true)}>Сформировать</Button>
              <Button variant="secondary" onClick={collapsePanel}>
                Скрыть
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4"
        >
          <Button onClick={expandPanel}>Показать панель</Button>
        </motion.div>
      )}

      <ChoiceDialog
        open={payDialogOpen}
        title="Подтверждение оплаты"
        description="Вы действительно хотите пометить документы как оплаченные без формирования документов?"
        onCancel={() => setPayDialogOpen(false)}
        choices={[
          {
            label: "Да, оплатить",
            onSelect: () => {
              onPay();
              setPayDialogOpen(false);
            },
          },
        ]}
      />

      <ChoiceDialog
        open={finalizeDialogOpen}
        title="Формирование платежей"
        description="Выберите способ формирования CSV:"
        onCancel={() => setFinalizeDialogOpen(false)}
        choices={[
          {
            label: "📦 Группировать по получателю",
            onSelect: () => {
              onGroupedFinalize();
              setFinalizeDialogOpen(false);
            },
          },
          {
            label: "📄 Не группировать",
            onSelect: () => {
              onFinalize();
              setFinalizeDialogOpen(false);
            },
          },
        ]}
      />
    </>
  );
};
