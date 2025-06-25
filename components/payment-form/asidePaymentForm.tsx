"use client";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/shared/datePicker";
import { isSameDay } from "date-fns";

export type Document = {
  id: number;
  account_number: string;
  date: Date;
  account_sum: number;
  partner: {
    short_name: string;
    full_name: string;
  };
};

type AsideProps = {
  docs: Document[];
  onRowClick: (docId: number) => void;
  className?: string;
};

export const AsidePaymentForm: React.FC<AsideProps> = ({
  docs,
  onRowClick,
  className,
}) => {
  const [sortedColumn, setSortedColumn] = useState<
    "partner" | "accountNumber" | "date" | "sum" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });

  const [filterPartner, setFilterPartner] = useState("");
  const [filterSum, setFilterSum] = useState("");
  const [filterDate, setFilterDate] = useState<Date | undefined>();
  const [filterAccount, setFilterAccount] = useState("");

  const handleSort = (column: "partner" | "accountNumber" | "date" | "sum") => {
    if (sortedColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortedColumn(column);
      setSortOrder("asc");
    }
  };

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      const matchesPartner = d.partner.short_name
        .toLowerCase()
        .includes(filterPartner.toLowerCase());
      const matchesAccount = d.account_number.includes(filterAccount);
      const matchesSum = filterSum
        ? d.account_sum.toString().includes(filterSum)
        : true;
      const matchesDate = filterDate
        ? isSameDay(new Date(d.date), filterDate)
        : true;

      return matchesPartner && matchesAccount && matchesSum && matchesDate;
    });
  }, [docs, filterPartner, filterAccount, filterSum, filterDate]);

  const sortedDocs = useMemo(() => {
    let sorted = [...filteredDocs];
    switch (sortedColumn) {
      case "partner":
        sorted.sort((a, b) =>
          sortOrder === "asc"
            ? collator.compare(a.partner.short_name, b.partner.short_name)
            : collator.compare(b.partner.short_name, a.partner.short_name)
        );
        break;
      case "accountNumber":
        sorted.sort((a, b) =>
          sortOrder === "asc"
            ? collator.compare(a.account_number, b.account_number)
            : collator.compare(b.account_number, a.account_number)
        );
        break;
      case "sum":
        sorted.sort((a, b) =>
          sortOrder === "asc"
            ? collator.compare(a.account_number, b.account_number)
            : collator.compare(b.account_number, a.account_number)
        );
        break;
      case "date":
        sorted.sort((a, b) =>
          sortOrder === "asc"
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      default:
        sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }
    return sorted;
  }, [filteredDocs, sortedColumn, sortOrder]);

  return (
    <aside
      className={cn(
        "w-[34dvw] min-w-[512px] h-[94dvh] space-y-2 rounded-3xl border-gray-200 border-2 mr-[30px]",
        className
      )}
    >
      <div className="w-auto h-[90dvh] overflow-y-scroll">
        <div className="p-1">
          <Table className="">
            <TableHeader className="bg-white sticky top-0 z-10">
              <TableRow className="">
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("partner")}>
                    Контрагент{" "}
                    {sortedColumn === "partner"
                      ? sortOrder === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("sum")}>
                    Сумма счета{" "}
                    {sortedColumn === "sum"
                      ? sortOrder === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Button>
                </TableHead>
                <TableHead className="w-1">
                  <Button variant="ghost" onClick={() => handleSort("date")}>
                    Дата счета{" "}
                    {sortedColumn === "date"
                      ? sortOrder === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("accountNumber")}
                  >
                    Номер счета{" "}
                    {sortedColumn === "accountNumber"
                      ? sortOrder === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Button>
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="p-1 font-normal">
                  <Input
                    value={filterPartner}
                    onChange={(e) => setFilterPartner(e.target.value)}
                    placeholder="Фильтр"
                    className="h-7"
                  />
                </TableHead>
                <TableHead className="p-1 font-normal">
                  <Input
                    value={filterSum}
                    onChange={(e) => setFilterSum(e.target.value)}
                    placeholder="Фильтр"
                    className="h-7 text-right"
                  />
                </TableHead>
                <TableHead className="p-1 font-normal">
                  <DatePicker
                    selected={filterDate}
                    onChange={setFilterDate}
                    className="w-full"
                  />
                </TableHead>
                <TableHead className="p-1 font-normal">
                  <Input
                    value={filterAccount}
                    onChange={(e) => setFilterAccount(e.target.value)}
                    placeholder="Фильтр"
                    className="h-7"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {sortedDocs.map((doc) => (
                <TableRow key={doc.id} onClick={() => onRowClick(doc.id)}>
                  <TableCell>{doc.partner.short_name}</TableCell>
                  <TableCell className="text-right">
                    {Number(doc.account_sum)}
                  </TableCell>
                  <TableCell>
                    {new Date(doc.date).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{doc.account_number}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </aside>
  );
};
