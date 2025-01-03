"use client";

import * as React from "react";
import { Combobox } from "@/components/shared";
import { partner_account_number } from "@prisma/client";
import { Control } from "react-hook-form";
import { FormValues } from "@/components/shared/paymentForm";

type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  id?: number | undefined;
  placeholder: string;
  empty: string;
  data: partner_account_number[];
  accountHandleChange: (id:partner_account_number) => void
};

export const AccountsCombobox: React.FC<Props> = ({
  id,
  name,
  label,
  description,
  control,
  placeholder,
  empty,
  data,
  accountHandleChange
}) => {

  const list = data
    ? data.map((e) => {
        return { key: String(e.id), value: e.bank_account };
      })
    : [];

  const onChange = (i: number) => {
    const bankAccount = data[i]
    accountHandleChange(bankAccount)
   }

  return (
    <Combobox
      control={control}
      name={name}
      label={label}
      description={description}
      placeholder={placeholder}
      empty={empty}
      onChange={onChange}
      id={id}
      list={list}
    />
  );
};
