"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/";

import { useDateStore } from "@/store/store";
import { addDays, format, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { apiClient } from "@/services/api-client";
import React from "react";
import { DocumentWithRelations } from "@/app/api/document/route";

type Props = {
  partnerNameFilter: string;
  onlyActive: boolean;
};

export const PaymentTable: React.FC<Props> = ({
  partnerNameFilter,
  onlyActive,
}) => {
  const [docs, setDocs] = React.useState<DocumentWithRelations[] | []>([]);
  const { startDate, goForward, goBackward } = useDateStore();

  React.useEffect(() => {
    apiClient.document.getAll().then((data) => {
      if (data) {
        // @ts-ignore
        setDocs(data);
        console.log(data);
      }
    });
  }, []);

  // Определим начало недели (понедельник) от startDate
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
  // Массив дат на неделю
  const datesOfWeek = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i)
  );

  // Фильтр партнёров
  const filteredPartners = docs.filter((partner) => {
    if (onlyActive && 1) return false;
    if (
      partnerNameFilter &&
      !partner.partners.name
        .toLowerCase()
        .includes(partnerNameFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <main className="p-4 flex-1">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={goBackward}>
          ← Неделя назад
        </Button>
        <div className="font-bold">
          Текущая неделя: {format(weekStart, "dd MMM yyyy", { locale: ru })}
          {" - "}
          {format(addDays(weekStart, 6), "dd MMM yyyy", { locale: ru })}
        </div>
        <Button variant="outline" onClick={goForward}>
          Неделя вперёд →
        </Button>
      </div>

      <div className="overflow-auto">
        <Table>
          {/* Шапка таблицы */}
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Партнёр</TableHead>
              {datesOfWeek.map((date, idx) => (
                <TableHead key={idx} className="whitespace-nowrap">
                  {format(date, "dd.MM (EEEE)", { locale: ru })}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* Тело таблицы */}
          <TableBody>
            {filteredPartners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell className="font-semibold">
                  {partner.partners.name}
                </TableCell>
                {datesOfWeek.map((date, idx) => (
                  <TableCell key={idx} className="text-center">
                    {/* Тут ваш контент / статус / платежки */}-
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {filteredPartners.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={datesOfWeek.length + 1}
                  className="text-center py-6"
                >
                  Нет данных
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
};
