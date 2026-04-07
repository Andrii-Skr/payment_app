"use client";

import { format, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { DocumentType, SpecDocType } from "../../types/types";

type Partner = DocumentType["partner"];

type PartnerDocumentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner;
  documents: DocumentType[];
};

type SortKey = "date" | "comment" | "sum" | "balance" | "payments";
type SortDirection = "asc" | "desc";
type SortState = { key: SortKey; direction: SortDirection };

const SORT_STORAGE_KEY = "partner-documents-modal-sort";
const DEFAULT_SORT: SortState = { key: "payments", direction: "desc" };
const SORT_KEYS: SortKey[] = ["date", "comment", "sum", "balance", "payments"];
const SORT_DIRECTIONS: SortDirection[] = ["asc", "desc"];

const isSortKey = (value: unknown): value is SortKey => SORT_KEYS.includes(value as SortKey);
const isSortDirection = (value: unknown): value is SortDirection => SORT_DIRECTIONS.includes(value as SortDirection);

const getInitialSort = (): SortState => {
  if (typeof window === "undefined") return DEFAULT_SORT;

  try {
    const raw = window.localStorage.getItem(SORT_STORAGE_KEY);
    if (!raw) return DEFAULT_SORT;

    const parsed = JSON.parse(raw) as Partial<SortState>;
    if (!isSortKey(parsed.key) || !isSortDirection(parsed.direction)) return DEFAULT_SORT;

    return { key: parsed.key, direction: parsed.direction };
  } catch {
    return DEFAULT_SORT;
  }
};

export const PartnerDocumentsModal: React.FC<PartnerDocumentsModalProps> = ({
  isOpen,
  onClose,
  partner,
  documents,
}) => {
  const router = useRouter();

  // DatePicker хранит выбранную дату как объект Date | undefined
  const [filterDate, setFilterDate] = React.useState<Date | undefined>();
  const [filterSum, setFilterSum] = React.useState("");
  const [sortState, setSortState] = React.useState<SortState>(getInitialSort);
  const sortKey = sortState.key;
  const sortDirection = sortState.direction;

  React.useEffect(() => {
    try {
      window.localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sortState));
    } catch {
      // Ignore localStorage write errors (private mode / disabled storage).
    }
  }, [sortState]);

  if (!isOpen) return null;

  const getTotalSpecSum = (doc: DocumentType) =>
    doc.spec_doc.reduce((sum, spec: SpecDocType) => sum + Number(spec.pay_sum), 0);

  const getBalance = (doc: DocumentType) => Number(doc.account_sum) - getTotalSpecSum(doc);
  const getSpecDateTimestamp = (spec: SpecDocType) => {
    const rawDate = spec.expected_date ?? spec.dead_line_date;
    if (!rawDate) return Number.NEGATIVE_INFINITY;

    const timestamp = new Date(rawDate as unknown as string).getTime();
    return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
  };
  const getPaymentsSortTimestamp = (doc: DocumentType) =>
    doc.spec_doc.reduce(
      (maxTimestamp, spec) => Math.max(maxTimestamp, getSpecDateTimestamp(spec)),
      Number.NEGATIVE_INFINITY,
    );

  const collator = new Intl.Collator("ru-RU", { numeric: true, sensitivity: "base" });

  const getDefaultDirection = (key: SortKey): SortDirection => (key === "comment" ? "asc" : "desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortState((prev) => ({
        ...prev,
        direction: prev.direction === "asc" ? "desc" : "asc",
      }));
      return;
    }

    setSortState({
      key,
      direction: getDefaultDirection(key),
    });
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  /* ---------- фильтрация ---------- */
  const filteredDocuments = documents.filter((doc) => {
    const matchesDate = filterDate ? isSameDay(new Date(doc.date), filterDate) : true;

    const matchesSum = filterSum ? doc.account_sum.toString().includes(filterSum) : true;

    return matchesDate && matchesSum;
  });

  /* ---------- сортировка по активной колонке ---------- */
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let compareResult = 0;

    switch (sortKey) {
      case "date":
        compareResult = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "comment":
        compareResult = collator.compare(a.note ?? "", b.note ?? "");
        break;
      case "sum":
        compareResult = Number(a.account_sum) - Number(b.account_sum);
        break;
      case "balance":
        compareResult = getBalance(a) - getBalance(b);
        break;
      case "payments":
        compareResult = getPaymentsSortTimestamp(a) - getPaymentsSortTimestamp(b);
        break;
      default:
        compareResult = 0;
    }

    if (compareResult === 0) {
      compareResult = new Date(b.date).getTime() - new Date(a.date).getTime();
    }

    return sortDirection === "asc" ? compareResult : -compareResult;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[92vw] max-w-[1180px] p-0">
      <div className="w-full p-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-bold">Счета по {partner.short_name}</h2>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>

        {/* Фильтры */}
        <div className="mb-5 mt-4 grid grid-cols-1 gap-4 md:max-w-[840px] md:grid-cols-2">
          {/* DatePicker */}
          <div className="space-y-1">
            <Label className="text-sm">Фильтр по дате</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 w-full max-w-none justify-start px-3 text-left font-normal">
                  {filterDate ? format(filterDate, "dd.MM.yyyy") : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar mode="single" captionLayout="dropdown" selected={filterDate} onSelect={setFilterDate} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Input для суммы */}
          <div className="flex-1 space-y-1">
            <Label className="text-sm">Фильтр по сумме</Label>
            <Input
              className="!h-10 w-full !max-w-none"
              type="text"
              value={filterSum}
              onChange={(e) => setFilterSum(e.target.value)}
              placeholder="Введите сумму"
            />
          </div>
        </div>

        {/* Таблица */}
        <Table containerClassName="overflow-x-auto" className="w-full min-w-[920px] table-fixed">
          <colgroup>
            <col className="w-[140px]" />
            <col className="w-[34%]" />
            <col className="w-[140px]" />
            <col className="w-[140px]" />
            <col />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 whitespace-nowrap"
                  onClick={() => handleSort("date")}
                >
                  <span>Дата счета</span>
                  <span className="text-xs leading-none">{sortIcon("date")}</span>
                </button>
              </TableHead>
              <TableHead className="w-56">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-left"
                  onClick={() => handleSort("comment")}
                >
                  <span className="truncate">Комментарий к платежу</span>
                  <span className="text-xs leading-none">{sortIcon("comment")}</span>
                </button>
              </TableHead>
              <TableHead className="w-32 text-right">
                <button
                  type="button"
                  className="ml-auto inline-flex items-center gap-1 whitespace-nowrap"
                  onClick={() => handleSort("sum")}
                >
                  <span>Сумма</span>
                  <span className="text-xs leading-none">{sortIcon("sum")}</span>
                </button>
              </TableHead>
              <TableHead className="w-32 text-right">
                <button
                  type="button"
                  className="ml-auto inline-flex items-center gap-1 whitespace-nowrap"
                  onClick={() => handleSort("balance")}
                >
                  <span>Остаток</span>
                  <span className="text-xs leading-none">{sortIcon("balance")}</span>
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 whitespace-nowrap"
                  onClick={() => handleSort("payments")}
                >
                  <span>Платежи</span>
                  <span className="text-xs leading-none">{sortIcon("payments")}</span>
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDocuments.map((doc) => {
              const balance = getBalance(doc).toFixed(2);

              return (
                <TableRow
                  key={doc.id}
                  className="hover:bg-muted"
                  onDoubleClick={() => router.push(`/create/payment-form/${doc.entity_id}?doc_id=${doc.id}`)}
                >
                  <TableCell className="px-2 py-2 align-top whitespace-nowrap">
                    {new Date(doc.date).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell className="max-w-0 px-2 py-2 align-top" title={doc.note ?? ""}>
                    <span className="block overflow-hidden text-ellipsis whitespace-pre-line break-words line-clamp-2">
                      {doc.note || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="px-2 py-2 text-right tabular-nums align-top">
                    {Number(doc.account_sum)}
                  </TableCell>
                  <TableCell className="px-2 py-2 text-right tabular-nums align-top">{balance}</TableCell>
                  <TableCell className="px-2 py-2 align-top">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {[...doc.spec_doc]
                        .sort((a, b) => {
                          const dateA = getSpecDateTimestamp(a);
                          const dateB = getSpecDateTimestamp(b);
                          return dateB - dateA;
                        })
                        .map((spec: SpecDocType) => {
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
                            <div key={spec.id} className="flex min-w-[96px] flex-col leading-tight">
                              <span className="whitespace-nowrap">{displayDate.toLocaleDateString("ru-RU")}</span>
                              <span className={amountClass}>{Number(spec.pay_sum)}</span>
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
