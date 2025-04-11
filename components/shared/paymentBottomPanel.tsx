"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { PaymentDetail } from "../../types/types";
import { usePaymentStore } from "../../store/store";

type GroupedPayments = Record<number, { name: string; total: number }>;

type PaymentBottomPanelProps = {
  pendingPayments: PaymentDetail[];
  groupedPayments: GroupedPayments;
  overallTotal: number;
  onFinalize: () => void;
  onPay: () => void;
};

export const PaymentBottomPanel: React.FC<PaymentBottomPanelProps> = ({
  pendingPayments,
  groupedPayments,
  overallTotal,
  onFinalize,
  onPay,
}) => {
  const isExpanded = usePaymentStore((state) => state.isPaymentPanelExpanded);
  const expandPanel = usePaymentStore((state) => state.expandPaymentPanel);
  const collapsePanel = usePaymentStore((state) => state.collapsePaymentPanel);

  if (pendingPayments.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 bg-gray-200 p-4 pl-20 pr-20 z-50 shadow-lg"
          >
            <div className="flex justify-end mb-2 font-bold text-lg">
              Общая сумма:{" "}
              {overallTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₴
            </div>
            <div className="flex justify-end items-center space-x-2 mt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Оплатить</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Подтверждение оплаты</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы действительно хотите пометить документы как{" "}
                      <b>оплаченные</b> без формирования документов?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={onPay}>
                      Да, оплатить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={onFinalize}>Сформировать</Button>
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
    </>
  );
};
