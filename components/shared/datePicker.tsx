import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  selected: Date | undefined | null;
  onChange: (day: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  preserveDayOnly?: boolean; // если true — устанавливает 00:00, иначе 12:00
};

export function DatePicker({ selected, onChange, disabled, className, preserveDayOnly = false }: Props) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      // 💡 Фикс: избегаем смещения дат при сохранении в timestamp with time zone
      preserveDayOnly
        ? day.setHours(0, 0, 0, 0) // безопасно для @db.Date
        : day.setHours(12, 0, 0, 0); // безопасно для @db.Timestamptz
    }

    onChange(day);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "date-picker-size justify-start text-left font-normal px-3 py-1",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "dd.MM.yyyy") : <span>Выберите Дату</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar mode="single" selected={selected ?? undefined} captionLayout="dropdown" onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
