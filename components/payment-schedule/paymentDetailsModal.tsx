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
import { PaymentDetail } from "../../types/types";
import { usePaymentStore } from "../../store/store";
import { useRouter } from "next/navigation"; // Импортируем useRouter

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
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const pendingPayments = usePaymentStore.getState().pendingPayments;
  const router = useRouter();

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
              <TableHead>Номер Счета</TableHead>
              <TableHead>Назначение Платежа</TableHead>
              <TableHead>Дата Счета</TableHead>
              <TableHead>Сумма платежа</TableHead>
              <TableHead>На оплату</TableHead>
              <TableHead>Крайний срок</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentDetails.map((detail) => (
              <TableRow
                key={detail.spec_doc_id}
                onDoubleClick={() =>
                  router.push(
                    `/create/payment-form/${detail.entity_id}?doc_id=${detail.doc_id}`
                  )
                }
              >
                <TableCell>{detail.account_number}</TableCell>
                <TableCell>{detail.purpose_of_payment}</TableCell>
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
                <TableCell>
                  {detail.dead_line_date
                    ? new Date(detail.dead_line_date).toLocaleDateString(
                        "ru-RU"
                      )
                    : ""}
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
