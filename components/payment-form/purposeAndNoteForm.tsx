import React from "react";
import { Container } from "@/components/shared";
import { useFormContext } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { VatSelector } from "@/components/payment-form/vatSelector";
import { usePurposeAutoFill } from "@/lib/hooks/usePurposeAutoFill";
import { FormTextarea } from "@/components/shared";

export const PurposeAndNoteForm: React.FC = () => {
  const { control, setValue } = useFormContext<FormValues>();

  usePurposeAutoFill<FormValues>(control, setValue);

  return (
    <Container className="justify-start items-start gap-5">
      <VatSelector control={control} />

      <FormTextarea
        control={control}
        name="purposeOfPayment"
        label="Назначение платежа"
      />

      <FormTextarea
        control={control}
        name="note"
        label="Комментарий к платежу"
      />
    </Container>
  );
};
