// Изменённый PaymentDetailsModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { PaymentDetail } from "../../types";
import { usePaymentStore } from "../../store/store";

export type PaymentDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedDetails: PaymentDetail[]) => void;
  title: string;
  paymentDetails: PaymentDetail[];
};

export const PaymentDetailsModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  paymentDetails,
}: PaymentDetailsModalProps) => {
  // Храним состояние выбранных строк: ключ – spec_doc_id, значение – true/false
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});

  const pendingPayments = usePaymentStore.getState().pendingPayments;

  useEffect(() => {
    const updated: Record<number, boolean> = {};
    paymentDetails.forEach((detail) => {
      updated[detail.spec_doc_id] = pendingPayments.some(
        (p) => p.spec_doc_id === detail.spec_doc_id
      );
    });
    setSelectedRows(updated);
  }, [paymentDetails, pendingPayments]);

  const toggleCheckbox = (spec_doc_id: number) => {
    setSelectedRows((prev) => ({ ...prev, [spec_doc_id]: !prev[spec_doc_id] }));
  };

  const handleSave = () => {
    const selected = paymentDetails.filter(
      (detail) => selectedRows[detail.spec_doc_id]
    );
    onSave(selected);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назначение Платежа</TableHead>
              <TableHead>Комментарий к платежу</TableHead> {/* Новый заголовок */}
              <TableHead>Дата Счета</TableHead>
              <TableHead>Сумма платежа</TableHead>
              <TableHead>На оплату</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentDetails.map((detail) => (
              <TableRow key={detail.spec_doc_id}>
                <TableCell>{detail.account_number}</TableCell>
                <TableCell>{detail.note}</TableCell> {/* Вывод комментария */}
                <TableCell>
                  {new Date(detail.date).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell>{detail.pay_sum}</TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={!!selectedRows[detail.spec_doc_id]}
                    onChange={() => toggleCheckbox(detail.spec_doc_id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </div>
      </div>
    </Modal>
  );
};
