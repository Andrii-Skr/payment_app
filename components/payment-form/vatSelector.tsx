// components/payment-form/VatSelector.tsx
import React from "react";
import { Container, FormInput } from "@/components/shared";
import { FormValues } from "@/types/formTypes";
import { Control, useWatch, useFormContext } from "react-hook-form";
import { Button, FormLabel } from "@/components/ui";

export const VatSelector: React.FC<{ control: Control<FormValues> }> = ({
  control,
}) => {
  const { setValue } = useFormContext();
  const vatType = useWatch({ control, name: "vatType" });

  return (
    <div className="flex flex-col gap-3 pl-1">
      <FormLabel className="text-sm font-medium">Тип налогообложения</FormLabel>

      <Container className="mt-[-10px] justify-start items-center gap-2">
        <Button
          type="button"
          onClick={() => setValue("vatType", "with")}
          className={`px-4 py-1 rounded-full border text-sm transition ${
            vatType === "with"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
          }`}
        >
          НДС
        </Button>

        <FormInput
          control={control}
          name="vatPercent"
          label=""
          placeholder="%"
          type="text"
          className="w-14"
          disabled={vatType !== "with"}
        />

        <Button
          type="button"
          onClick={() => setValue("vatType", "without")}
          className={`px-4 py-1 rounded-full border text-sm transition ${
            vatType === "without"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
          }`}
        >
          Без НДС
        </Button>
      </Container>
    </div>
  );
};
