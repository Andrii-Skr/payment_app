// components/payment-form/AccountDetailsForm.tsx
import React from "react";
import { Container, FormInput, FormDatePicker } from "@/components/shared";
import { Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { VatSelector } from "./vatSelector";

type Props = {
  control: Control<FormValues>;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onDoubleClick: () => void;
};

export const AccountDetailsForm: React.FC<Props> = ({
  control,
  onBlur,
  onDoubleClick,
}) => (
    <>
  <Container className="justify-start items-start gap-5">
    <FormInput
      control={control}
      className="no-spin"
      type="text"
      name="accountSum"
      label="Сумма счета"
      description="Сумма, указанная в счете"
      onBlur={onBlur}
      onDoubleClick={onDoubleClick}
      />
    <FormInput
      control={control}
      name="accountNumber"
      label="Номер счета"
      placeholder="Введите номер счета"
      description="Номер, указанный в счете"
      />
    <FormDatePicker
      control={control}
      name="date"
      label="Дата счета"
      description="Дата, указанная в счете"
      />
    </Container>
      </>
);
