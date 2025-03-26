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
} from "@/components/ui";
import { cn } from "@/lib/utils";

export type Document = {
  id: number;
  account_number: string;
  date: Date;
  partners: {
    name: string;
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
    "partner" | "purpose" | "date" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
  });

  const handleSort = (column: "partner" | "purpose" | "date") => {
    if (sortedColumn === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortedColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedDocs = useMemo(() => {
    let sorted = [...docs];
    switch (sortedColumn) {
      case "partner":
        sorted.sort((a, b) =>
          sortOrder === "asc"
            ? collator.compare(a.partners.name, b.partners.name)
            : collator.compare(b.partners.name, a.partners.name)
        );
        break;
      case "purpose":
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
  }, [docs, sortedColumn, sortOrder]);

  return (
    <aside
      className={cn(
        "w-[30dvw] h-[94dvh] space-y-2 rounded-3xl border-gray-200 border-2 mr-[30px] p-4",
        className
      )}
    >
      <div className="w-auto h-[90dvh] overflow-y-scroll">
        <div className="p-2">
          <Table>
            <TableHeader className="bg-white sticky top-0 z-10">
              <TableRow>
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
                  <Button variant="ghost" onClick={() => handleSort("purpose")}>
                    Номер счета{" "}
                    {sortedColumn === "purpose"
                      ? sortOrder === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("date")}>
                    Дата счета{" "}
                    {sortedColumn === "date"
                      ? sortOrder === "asc"
                        ? "↑"
                        : "↓"
                      : ""}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDocs.map((doc) => (
                <TableRow key={doc.id} onClick={() => onRowClick(doc.id)}>
                  <TableCell >{doc.partners.name}</TableCell>
                  <TableCell >{doc.account_number}</TableCell>
                  <TableCell className="text-center">
                    {new Date(doc.date).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </aside>
  );
};
