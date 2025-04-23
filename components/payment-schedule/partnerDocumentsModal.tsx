"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DocumentType, SpecDocType } from "../../types/types";
import { useRouter } from "next/navigation";

type Partner = DocumentType["partners"];

type PartnerDocumentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  documents: DocumentType[];
};

export const PartnerDocumentsModal: React.FC<PartnerDocumentsModalProps> = ({
  isOpen,
  onClose,
  partner,
  documents,
}) => {
  if (!isOpen) return null;

  const router = useRouter();
  // Фильтр по дате документа и по сумме
  const [filterDate, setFilterDate] = React.useState("");
  const [filterSum, setFilterSum] = React.useState("");

  // Фильтрация документов по дате и сумме
  const filteredDocuments = documents.filter((doc) => {
    const docDateStr = new Date(doc.date).toISOString().split("T")[0];
    const matchesDate = filterDate ? docDateStr === filterDate : true;
    const matchesSum = filterSum
      ? doc.account_sum.toString().includes(filterSum)
      : true;
    return matchesDate && matchesSum;
  });

  // Сортировка документов по дате (новые документы сначала)
  const sortedDocuments = [...filteredDocuments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-screen overflow-y-auto p-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Счета по {partner.name}</h2>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Фильтр по дате
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Выберите дату"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-1"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Фильтр по сумме
            </label>
            <input
              type="text"
              value={filterSum}
              onChange={(e) => setFilterSum(e.target.value)}
              placeholder="Введите сумму"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-1"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата счета</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Остаток</TableHead>
              <TableHead>Комментарий к платежу</TableHead>
              <TableHead>Платежи</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDocuments.map((doc) => {
              // Подсчёт остатка: вычитаем сумму всех spec.pay_sum и округляем до 2 знаков
              const totalSpecSum = doc.spec_doc.reduce(
                (sum, spec: SpecDocType) => sum + Number(spec.pay_sum),
                0
              );
              const balance = (Number(doc.account_sum) - totalSpecSum).toFixed(
                2
              );
              return (
                <TableRow
                  key={doc.id}
                  className="hover:bg-gray-100"
                  onDoubleClick={() =>
                    router.push(
                      `/create/payment-form/${doc.entity_id}?doc_id=${doc.id}`
                    )
                  }
                >
                  <TableCell>
                    {new Date(doc.date).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell>{Number(doc.account_sum)}</TableCell>
                  <TableCell>{balance}</TableCell>
                  <TableCell>{doc.purpose_of_payment}</TableCell>
                  <TableCell>
                    <div className="flex flex-row gap-4">
                      {doc.spec_doc.map((spec: SpecDocType) => {
                        // Выбираем expected_date, если он существует, иначе dead_line_date
                        const displayDate = spec.expected_date
                          ? new Date(spec.expected_date)
                          : spec.dead_line_date
                          ? new Date(spec.dead_line_date)
                          : new Date();
                        // Определяем класс для суммы:
                        // Если is_paid === true, используем зеленый;
                        // Если не оплачен и expected_date существует, красный;
                        // Если не оплачен и только dead_line_date, красный жирный.
                        const amountClass = spec.is_paid
                          ? "text-green-500"
                          : spec.expected_date
                          ? "text-red-500"
                          : spec.dead_line_date
                          ? "text-red-500 font-bold"
                          : "";
                        return (
                          <div key={spec.id} className="flex flex-col">
                            <div>{displayDate.toLocaleDateString("ru-RU")}</div>
                            <div className={amountClass}>{Number(spec.pay_sum)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Modal>
  );
};
