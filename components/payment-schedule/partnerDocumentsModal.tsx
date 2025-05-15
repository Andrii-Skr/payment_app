"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay } from "date-fns";

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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DocumentType, SpecDocType } from "../../types/types";

type Partner = DocumentType["partner"];

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

  // DatePicker хранит выбранную дату как объект Date | undefined
  const [filterDate, setFilterDate] = React.useState<Date | undefined>();
  const [filterSum, setFilterSum] = React.useState("");

  /* ---------- фильтрация ---------- */
  const filteredDocuments = documents.filter((doc) => {
    const matchesDate = filterDate
      ? isSameDay(new Date(doc.date), filterDate)
      : true;

    const matchesSum = filterSum
      ? doc.account_sum.toString().includes(filterSum)
      : true;

    return matchesDate && matchesSum;
  });

  /* ---------- сортировка по дате (новые выше) ---------- */
  const sortedDocuments = [...filteredDocuments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-screen overflow-y-auto p-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold">Счета по {partner.short_name}</h2>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>

        {/* Фильтры */}
        <div className="mb-4 flex gap-4">
          {/* DatePicker */}
          <div className="flex-1 space-y-1">
            <Label className="text-sm">Фильтр по дате</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {filterDate
                    ? format(filterDate, "dd.MM.yyyy")
                    : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDate}
                  onSelect={setFilterDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Input для суммы */}
          <div className="flex-1 space-y-1">
            <Label className="text-sm">Фильтр по сумме</Label>
            <Input
              type="text"
              value={filterSum}
              onChange={(e) => setFilterSum(e.target.value)}
              placeholder="Введите сумму"
            />
          </div>
        </div>

        {/* Таблица */}
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
                  className="hover:bg-muted"
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
                    <div className="flex gap-4">
                      {doc.spec_doc.map((spec: SpecDocType) => {
                        const displayDate = spec.expected_date
                          ? new Date(spec.expected_date)
                          : spec.dead_line_date
                          ? new Date(spec.dead_line_date)
                          : new Date();

                        const amountClass = spec.is_paid
                          ? "text-green-500"
                          : spec.expected_date
                          ? "text-red-500"
                          : spec.dead_line_date
                          ? "text-red-500 font-bold"
                          : "";

                        return (
                          <div key={spec.id} className="flex flex-col">
                            <span>
                              {displayDate.toLocaleDateString("ru-RU")}
                            </span>
                            <span className={amountClass}>
                              {Number(spec.pay_sum)}
                            </span>
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
