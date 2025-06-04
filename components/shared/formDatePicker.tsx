"use client";

import React from "react";
import { DatePicker } from "@/components/shared/datePicker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui";
import { Control, FieldValues, Path } from "react-hook-form";

type FormDatePickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  readOnly?: boolean;
  preserveDayOnly?: boolean;
};

export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  description,
  readOnly,
  preserveDayOnly = false,
}: FormDatePickerProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
  const rawValue = field.value as unknown;
        console.log("Date",typeof rawValue)
  const value =
    typeof rawValue === "string"
      ? new Date(rawValue)
      : rawValue instanceof Date
      ? rawValue
      : null;

  return (
    <FormItem className="flex flex-col space-y-1">
      <FormLabel className="mt-1 mb-1.5">{label}</FormLabel>
      <FormControl>
        <DatePicker
          selected={value}
          onChange={field.onChange}
          disabled={readOnly}
          preserveDayOnly={preserveDayOnly}
        />
      </FormControl>
      {description && (
        <FormDescription className="mb-2">{description}</FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
}}
    />
  );
}
