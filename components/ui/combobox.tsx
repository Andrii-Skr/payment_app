"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ComboboxOption = { key: string; value: string; label?: React.ReactNode };

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  description?: string;
  placeholder: string;
  empty: string;
  className?: string;
  onChange: (id: number) => void;
  list: ComboboxOption[];
  disabled?: boolean;
};

export const Combobox = <TFieldValues extends FieldValues>({
  onChange,
  name,
  label,
  control,
  placeholder,
  empty,
  list,
  className,
  disabled,
}: Props<TFieldValues>) => {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col content-between">
          <FormLabel className="mb-1">{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn("combobox-size first-letter:px-3 py-1 justify-between", className)}
                disabled={disabled}
              >
                {field.value
                  ? list?.find((row) => {
                      return row.value === String(field.value);
                    })?.label || list?.find((row) => row.value === String(field.value))?.value
                  : placeholder}
                <ChevronsUpDown className="ml-0 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[320px] max-w-[520px] w-auto p-0">
              <Command>
                <CommandInput placeholder={placeholder} disabled={disabled} />
                <CommandList className="overflow-x-auto">
                  <CommandEmpty>{empty}</CommandEmpty>
                  <CommandGroup>
                    {list.map((row, i) => (
                      <CommandItem
                        key={row.key}
                        value={row.value}
                        onSelect={(currentValue) => {
                          if (disabled) return;
                          field.onChange(currentValue === String(field.value) ? "1" : currentValue);
                          onChange(i);
                          setOpen(false);
                        }}
                        disabled={disabled}
                        className="whitespace-nowrap"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            String(field.value) === row.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {row.label ?? row.value}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
};
