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
  className?: string;
};

export const AccountsCombobox: React.FC<Props> = ({
  name,
  label,
  description,
  control,
  placeholder,
  empty,
  className,
}) => {
  const currentAccountList = useAccountListStore(
    (state) => state.currentAccountList
  );

  const list = currentAccountList?.map((e) => ({
    key: String(e.id),
    value: e.bank_account,
  })) ?? [];

  const { setValue, watch } = useFormContext<FormValues>();

  const selectedId = watch("partner_account_number_id");
  const selectedAccount = currentAccountList?.find((a) => a.id === selectedId);
  const bankAccount = selectedAccount?.bank_account;

  // Установка дефолтного счёта при первом получении списка
  useEffect(() => {
    if (!currentAccountList?.length) return;

    const hasSelected = selectedId !== undefined && selectedId !== null;
    const defaultAccount = currentAccountList.find((a) => a.is_default);

    if (!hasSelected && defaultAccount) {
      setValue("partner_account_number_id", defaultAccount.id);
      setValue("selectedAccount", defaultAccount.bank_account);
    }
  }, [currentAccountList, selectedId, setValue]);

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
      className={className}
    />
  );
};
