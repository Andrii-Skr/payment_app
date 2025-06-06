// components/payment-form/AccountDetailsForm.tsx
import React from "react";
import {
  Container,
  FormInput,
  FormDatePicker,
  ContainerGrid,
} from "@/components/shared";
import { Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";

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
      />
      <FormDatePicker
        control={control}
        name="date"
        label="Дата счета/договора"
        description="Дата, указанная в счете"
        preserveDayOnly={true}
      />
    </ContainerGrid>
  </>
);
