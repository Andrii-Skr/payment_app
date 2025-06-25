'use client'

import React from "react";
import { ContainerGrid, FormTextarea, FormCheckbox } from "@/components/shared";
import { useFormContext } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { VatSelector } from "@/components/shared/vatSelector";
import { usePurposeAutoFill } from "@/lib/hooks/usePurposeAutoFill";

export const PurposeAndNoteForm: React.FC = () => {
  const { control, setValue } = useFormContext<FormValues>();

  usePurposeAutoFill<FormValues>(control, setValue);

  return (
    <>
      <FormTextarea
        control={control}
        name="purposeOfPayment"
        label="Назначение платежа"
        className="textarea-size"
      />
      <FormCheckbox
        control={control}
        name="is_auto_purpose_of_payment"
        label="Автозаполнение назначения"
        className="justify-end !mb-[-15px]"
      />
      <ContainerGrid className="sm:grid-cols-2 lg:grid-cols-[1fr_2fr] items-center">
        <VatSelector control={control} setValue={setValue} />

        <FormTextarea
          control={control}
          name="note"
          label="Комментарий к платежу"
          className="w-full h-[39px]"
        />
      </ContainerGrid>
    </>
  );
};
