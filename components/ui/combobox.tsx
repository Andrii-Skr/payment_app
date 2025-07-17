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
import { FormField, FormItem, FormLabel } from "@/components/ui";
import { Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";

type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  placeholder: string;
  empty: string;
  className?: string;
  onChange: (id: number) => void;
  list: { key: string; value: string }[];
  disabled?: boolean;
};

export const Combobox: React.FC<Props> = ({
  onChange,
  name,
  label,
  control,
  placeholder,
  empty,
  list,
  className,
  disabled,
}) => {
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
                className={cn(
                  "combobox-size first-letter:px-3 py-1 justify-between",
                  className
                )}
                disabled={disabled}
              >
                {field.value
                  ? list?.find((row) => {
                      return row.value === field.value;
                    })?.value
                  : placeholder}
                <ChevronsUpDown className="ml-0 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder={placeholder} disabled={disabled} />
                <CommandList>
                  <CommandEmpty>{empty}</CommandEmpty>
                  <CommandGroup>
                    {list.map((row, i) => (
                      <CommandItem
                        key={row.key}
                        value={row.value}
                        onSelect={(currentValue) => {
                          if (disabled) return;
                          field.onChange(
                            currentValue === field.value ? "1" : currentValue
                          );
                          onChange(i);
                          setOpen(false);
                        }}
                        disabled={disabled}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === row.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {row.value}
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
