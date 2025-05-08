"use client";

import * as React from "react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { useAccountListStore } from "@/store/store";
import { Combobox } from "@/components/shared";
import { useAutoFillBankDetails } from "@/lib/hooks/useAutoFillBankDetails";

type Props = {
  control: any;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  id?: number | undefined;
  placeholder: string;
  empty: string;
};

export const AccountsCombobox: React.FC<Props> = ({
  name,
  label,
  description,
  control,
  placeholder,
  empty,
}) => {
  const currentAccountList = useAccountListStore(
    (state) => state.currentAccountList
  );

  const list = currentAccountList
    ? currentAccountList.map((e) => ({
        key: String(e.id),
        value: e.bank_account,
      }))
    : [];

  const { setValue, watch } = useFormContext<FormValues>();

  // Обработка выбора в Combobox
  const onChange = (i: number) => {
    const selected = currentAccountList[i];

    if (!selected) {
      setValue("partner_account_number_id", undefined);
      setValue("selectedAccount", "");
      setValue("mfo", "");
      setValue("bank_name", "");
      return;
    }

    setValue("partner_account_number_id", selected.id);
    setValue("selectedAccount", selected.bank_account);
  };

  // Получение bank_account из выбранного ID
  const selectedId = watch("partner_account_number_id");
  const selectedAccount = currentAccountList.find((a) => a.id === selectedId);
  const bankAccount = selectedAccount?.bank_account;

  // Автозаполнение MFO и bank_name
  const { mfo, bankName } = useAutoFillBankDetails(bankAccount);

  useEffect(() => {
    if (!bankAccount) {
      setValue("mfo", "");
      setValue("bank_name", "");
      return;
    }

    setValue("mfo", mfo || "");
    setValue("bank_name", bankName || "");
  }, [bankAccount, mfo, bankName, setValue]);

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
