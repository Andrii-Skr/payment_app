import React from "react";
import { Container, FormInput } from "@/components/shared";
import { Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { VatSelector } from "@/components/payment-form/vatSelector";

export const PurposeAndNoteForm: React.FC<{ control: Control<FormValues> }> = ({
  control,
}) => (
  <Container className="justify-start items-start gap-5">
    <VatSelector control={control} />
    <FormInput
      control={control}
      name="purposeOfPayment"
      label="Назначение платежа"
      description="Назначение платежа"
    />
    <FormInput
      control={control}
      name="note"
      label="Комментарий к платежу"
      description="Комментарий к счету"
    />
  </Container>
);
