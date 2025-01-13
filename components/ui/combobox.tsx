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
import { Container } from "@/components/shared";
import { Control } from "react-hook-form";
import { FormValues } from "@/components/shared/paymentForm";
// import { useFormStore } from "@/store/store"

type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  id: number | undefined;
  placeholder: string;
  empty: string;
  onChange: (id: number) => void;
  list: {key: string, value: string}[];
};

export const Combobox: React.FC<Props> = ({
  id,
  onChange,
  name,
  label,
  control,
  placeholder,
  empty,
  list,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Container className="flex flex-col space-y-2">
          <FormItem className="flex flex-col content-between">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[300px] h-9 px-3 py-1 justify-between"
                >
                  {field.value
                    ? list?.find(
                        (row) => row.value === field.value
                      )?.value
                    : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder={placeholder} />
                  <CommandList>
                    <CommandEmpty>{empty}</CommandEmpty>
                    <CommandGroup>
                      {list.map((row,i) => (
                        <CommandItem
                          key={row.key}
                          value={row.value}
                          onSelect={(currentValue) => {
                            field.onChange(
                              currentValue === field.value ? "" : currentValue
                            );
                            onChange(i);
                            setOpen(false);
                          }}
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
        </Container>
      )}
    />
  );
};
