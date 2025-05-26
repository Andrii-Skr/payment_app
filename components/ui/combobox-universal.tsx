"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Option = { value: number; label: string };

type Props = {
  options: Option[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  empty?: string;
  label?: string;
};

export const ComboboxUniversal: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "Выберите...",
  empty = "Не найдено",
  className,
  label,
}) => {
  const [open, setOpen] = React.useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("w-full flex flex-col gap-1", className)}>
      {label && <span className="text-sm font-medium mb-1">{label}</span>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected ? selected.label : <span className="text-muted-foreground">{placeholder}</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>{empty}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={String(option.value)}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
