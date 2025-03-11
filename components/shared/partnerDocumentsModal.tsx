"use client";
import React, { useState } from "react";
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
import { DocumentType, SpecDocType } from "../../types";

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

  const [filterAccount, setFilterAccount] = useState("");
  const [filterSum, setFilterSum] = useState("");

  // Фильтрация документов по номеру счета и сумме
  const filteredDocuments = documents.filter((doc) => {
    const matchesAccount = filterAccount
      ? doc.account_number.toString().includes(filterAccount)
      : true;
    const matchesSum = filterSum
      ? doc.account_sum.toString().includes(filterSum)
      : true;
    return matchesAccount && matchesSum;
  });

  // Простая сортировка документов (можно адаптировать при необходимости)
  const sortedDocuments = [...filteredDocuments].sort((a, b) => a.id - b.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-screen overflow-y-auto p-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Документы для счета</h2>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Фильтр по номеру счета
            </label>
            <input
              type="text"
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              placeholder="Введите номер счета"
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
              <TableHead>Платежи</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDocuments.map((doc) => {
              const totalPaid = doc.spec_doc
                .filter((spec: SpecDocType) => spec.is_paid)
                .reduce((sum, spec) => sum + Number(spec.pay_sum), 0);
              const balance = Number(doc.account_sum) - totalPaid;
              return (
                <TableRow key={doc.id} className="hover:bg-gray-100">
                  <TableCell>
                    {new Date(doc.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{doc.account_sum}</TableCell>
                  <TableCell>{balance}</TableCell>
                  <TableCell>
                    {doc.spec_doc.map((spec: SpecDocType, index) => {
                      const expectedDate = new Date(spec.expected_date);
                      const deadLineDate = spec.dead_line_date
                        ? new Date(spec.dead_line_date)
                        : null;
                      const computedDate =
                        deadLineDate && deadLineDate > expectedDate
                          ? deadLineDate
                          : expectedDate;
                      const displayDate = spec.is_paid
                        ? new Date(spec.paid_date)
                        : computedDate;
                      return (
                        <span
                          key={spec.id}
                          className={spec.is_paid ? "text-green-500" : ""}
                        >
                          {displayDate.toLocaleDateString()} ({spec.pay_sum})
                          {index < doc.spec_doc.length - 1 && ", "}
                        </span>
                      );
                    })}
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
