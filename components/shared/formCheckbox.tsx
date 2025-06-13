import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui";
import { Control, FieldValues, Path } from "react-hook-form";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
}

export function FormCheckbox<T extends FieldValues>({ control, name, label }: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={checked => field.onChange(!!checked)}
            />
          </FormControl>
          <FormLabel className="!mt-0">{label}</FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
