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
import { PaymentDetail } from "@/types/types";
import { usePaymentStore } from "@/store/paymentStore";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Roles } from "@/constants/roles";
import { apiClient } from "@/services/api-client";
import { toast } from "@/lib/hooks/use-toast";

export interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedDetails: PaymentDetail[]) => void;
  title: string;
  paymentDetails: PaymentDetail[];
  reloadDocuments: () => Promise<void>;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  paymentDetails,
  reloadDocuments,
}) => {
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"unpaid" | "paid">("unpaid");
  const [details, setDetails] = useState<PaymentDetail[]>(paymentDetails);

  const { canAccess } = useAccessControl();
  const isAdmin = canAccess(Roles.ADMIN);

  const {
    pendingPayments,
    setPendingPayments,
  } = usePaymentStore();

  const unpaidDetails = details.filter((d) => !d.is_paid);
  const paidDetails = details.filter((d) => d.is_paid);

  useEffect(() => {
    const updated: Record<number, boolean> = {};
    unpaidDetails.forEach((detail) => {
      updated[detail.spec_doc_id] = pendingPayments.some(
        (p) => p.spec_doc_id === detail.spec_doc_id
      );
    });
    setSelectedRows(updated);
  }, [details, pendingPayments]);

  const toggleCheckbox = (spec_doc_id: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [spec_doc_id]: !prev[spec_doc_id],
    }));
  };

  const handleSave = () => {
    const selected = unpaidDetails.filter(
      (detail) => selectedRows[detail.spec_doc_id]
    );
    onSave(selected);
    onClose();
  };

  const handleUnpay = async (id: number) => {
    try {
      await apiClient.specDocs.unpay(id);
      toast.success("Оплата отменена");

      // обновим таблицу
      await reloadDocuments();
    } catch (error) {
      toast.error("Ошибка при отмене оплаты");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {isAdmin && (
          <div className="mb-4 flex gap-4">
            <button
              className={activeTab === "unpaid" ? "font-bold underline" : ""}
              onClick={() => setActiveTab("unpaid")}
            >
              Ожидающие оплаты
            </button>
            <button
              className={activeTab === "paid" ? "font-bold underline" : ""}
              onClick={() => setActiveTab("paid")}
            >
              Оплаченные
            </button>
          </div>
        )}

        {activeTab === "unpaid" && (
          <>
            <h3 className="font-semibold text-lg mb-2">Ожидающие оплаты</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер</TableHead>
                  <TableHead>Назначение</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Выбрать</TableHead>
                  <TableHead>Срок</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidDetails.map((detail) => (
                  <TableRow key={detail.spec_doc_id}>
                    <TableCell>{detail.account_number}</TableCell>
                    <TableCell>{detail.purpose_of_payment}</TableCell>
                    <TableCell>{new Date(detail.date).toLocaleDateString("ru-RU")}</TableCell>
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
                        ? new Date(detail.dead_line_date).toLocaleDateString("ru-RU")
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {activeTab === "paid" && isAdmin && paidDetails.length > 0 && (
          <>
            <h3 className="font-semibold text-lg mb-2">Оплаченные</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер</TableHead>
                  <TableHead>Назначение</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidDetails.map((detail) => (
                  <TableRow key={detail.spec_doc_id}>
                    <TableCell>{detail.account_number}</TableCell>
                    <TableCell>{detail.purpose_of_payment}</TableCell>
                    <TableCell>{new Date(detail.date).toLocaleDateString("ru-RU")}</TableCell>
                    <TableCell>{detail.pay_sum}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnpay(detail.spec_doc_id)}
                      >
                        Отменить оплату
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </div>
      </div>
    </Modal>
  );
};
