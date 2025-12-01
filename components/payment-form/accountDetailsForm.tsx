// components/payment-form/AccountDetailsForm.tsx
import type React from "react";
import { type Control, useWatch } from "react-hook-form";
import { ContainerGrid, FormDatePicker, FormInput } from "@/components/shared";
import type { FormValues } from "@/types/formTypes";

type Props = {
  control: Control<FormValues>;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onDoubleClick: () => void;
};

export const AccountDetailsForm: React.FC<Props> = ({ control, onBlur, onDoubleClick }) => {
  const payments = useWatch({ control, name: "payments" });
  const hasPaid = payments?.some((p) => p?.isPaid);

  return (
    <ContainerGrid className="">
      <FormInput
        control={control}
        className="no-spin"
        type="text"
        name="accountSum"
        label="Сумма счета/договора"
        description="Сумма, указанная в счете"
        onBlur={onBlur}
        onDoubleClick={onDoubleClick}
      />
      <FormInput
        control={control}
        name="accountNumber"
        label="Номер счета/договора"
        placeholder="Введите номер счета"
        description="Номер, указанный в счете"
        readOnly={hasPaid}
      />
      <FormDatePicker
        control={control}
        name="date"
        label="Дата счета/договора"
        description="Дата, указанная в счете"
        preserveDayOnly={true}
        readOnly={hasPaid}
      />
    </ContainerGrid>
  );
};
