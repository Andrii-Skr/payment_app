"use client";

import * as React from "react";
import { Combobox } from "@/components/shared";
import { partner_account_number } from "@prisma/client";
import { Control, useFormContext } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { useAccountListStore } from "@/store/store";

type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  id?: number | undefined;
  placeholder: string;
  empty: string;
  //accountHandleChange: (id:partner_account_number) => void
};

export const AccountsCombobox: React.FC<Props> = ({
  name,
  label,
  description,
  control,
  placeholder,
  empty,
  //accountHandleChange
}) => {
  const currentAccountList = useAccountListStore(
    (state) => state.currentAccountList
  );

  const list = currentAccountList
    ? currentAccountList.map((e) => {
        return { key: String(e.id), value: e.bank_account };
      })
    : [];

  const { setValue } = useFormContext();

  const onChange = (i: number) => {
    const bankAccount = currentAccountList[i];
    setValue("mfo", bankAccount?.mfo || "");
  };

  return (
    <Combobox
      control={control}
      name={name}
      label={label}
      description={description}
      placeholder={placeholder}
      empty={empty}
      onChange={onChange}
      list={list}
    />
  );
};
