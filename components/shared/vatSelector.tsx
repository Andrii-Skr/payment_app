"use client";
import React from "react";
import {
  Control,
  FieldValues,
  Path,
  useWatch,
  UseFormSetValue,
} from "react-hook-form";
import { Button, FormLabel } from "@/components/ui";
import { FormInput } from "@/components/shared";
import { cn } from "@/lib/utils";

interface VatSelectorProps<T extends FieldValues> {
  control: Control<T>;
  /** передаём setValue из useForm() */
  setValue: UseFormSetValue<T>;

  vatTypeName?: Path<T>;     // default "vatType"
  vatPercentName?: Path<T>;  // default "vatPercent"
  className?: string;
}

export function VatSelector<T extends FieldValues>({
  control,
  setValue,
  vatTypeName,
  vatPercentName,
  className,
}: VatSelectorProps<T>) {
  const typeName = (vatTypeName ?? "vatType") as Path<T>;
  const percentName = (vatPercentName ?? "vatPercent") as Path<T>;

  const vatType = useWatch({ control, name: typeName });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <FormLabel className="text-sm">Тип налогообложения</FormLabel>

      <div className="flex items-center gap-2 mt-[-5px]">
        <Button
          type="button"
          onClick={() => setValue(typeName, true as any)}
          className={`px-4 py-1 rounded-full border text-sm transition ${
            vatType === true
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
          }`}
        >
          НДС
        </Button>

        <div className="relative">
          <FormInput
            control={control}
            name={percentName}
            type="number"
            className="no-spin vat-input-size pr-5 pl-0 text-right"
            disabled={!vatType}
            label=""
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            %
          </span>
        </div>

        <Button
          type="button"
          onClick={() => setValue(typeName, false as any)}
          className={`px-4 py-1 rounded-full border text-sm transition ${
            vatType === false
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
          }`}
        >

          Без НДС
        </Button>
      </div>
    </div>
  );
}
