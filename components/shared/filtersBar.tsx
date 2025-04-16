// components/FiltersBar.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/shared/datePicker";

type FiltersBarProps = {
  startDate: Date;
  setStartDate: (date: Date) => void;
  period: number;
  setPeriod: (val: number) => void;
  selectedEntity: number | "all";
  setSelectedEntity: (val: number | "all") => void;
  partnerFilter: string;
  setPartnerFilter: (val: string) => void;
  entityNames: Record<number, string>;
  dateRange: Date[];
};

export const FiltersBar: React.FC<FiltersBarProps> = ({
  startDate,
  setStartDate,
  period,
  setPeriod,
  selectedEntity,
  setSelectedEntity,
  partnerFilter,
  setPartnerFilter,
  entityNames,
  dateRange,
}) => {
  const [formattedRange, setFormattedRange] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined" && dateRange.length >= period) {
      const formatter = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Kyiv",
      });
      setFormattedRange(
        `${formatter.format(dateRange[0])} - ${formatter.format(
          dateRange[period - 1]
        )}`
      );
    }
  }, [dateRange, period]);

  const handlePrev = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 1);
    setStartDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 1);
    setStartDate(newDate);
  };

  return (
    <div className="flex items-center justify-start mb-4 gap-5">
      <div className="flex items-center space-x-2">
        <Button onClick={handlePrev}>←</Button>
        <DatePicker
          className="w-[130px]"
          selected={startDate}
          onChange={(day) => {
            if (day) setStartDate(day);
          }}
        />
        <Button onClick={handleNext}>→</Button>
      </div>

      <div className="flex justify-start items-center space-x-2">
        {[7, 14, 30].map((d) => (
          <Button
            key={d}
            variant={period === d ? "secondary" : "default"}
            onClick={() => setPeriod(d)}
          >
            {d === 30 ? "Месяц" : `${d} дней`}
          </Button>
        ))}
        <Select
          value={selectedEntity === "all" ? "all" : selectedEntity.toString()}
          onValueChange={(value) =>
            setSelectedEntity(value === "all" ? "all" : Number(value))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все ЮрЛица" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все ЮрЛица</SelectItem>
            {Object.entries(entityNames).map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="text"
          placeholder="Фильтр по Контрагенту"
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="border rounded p-1"
        />
      </div>

      <div className="text-sm text-gray-600">{formattedRange}</div>
    </div>
  );
};
