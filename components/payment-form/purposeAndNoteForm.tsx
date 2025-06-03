import React from "react";
import { ContainerGrid, FormTextarea } from "@/components/shared";
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
      />
      <ContainerGrid className="sm:grid-cols-2 lg:grid-cols-[1fr_2fr]">
        <VatSelector control={control} setValue={setValue} />

        <FormTextarea
          control={control}
          name="note"
          label="Комментарий к платежу"
        />
      </ContainerGrid>
    </>
  );
};
