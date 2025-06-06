"use client";
import * as React from "react";
import { useEffect } from "react";
import { Control, useFormContext } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { useAccountListStore } from "@/store/store";
import { Combobox } from "@/components/shared";
import { useAutoFillBankDetails } from "@/lib/hooks/useAutoFillBankDetails";

type Props = {
  control: Control<FormValues>;
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

  const list =
    currentAccountList
      ?.filter((a) => !a.is_deleted)
      .map((e) => ({
        key: String(e.id),
        value: e.bank_account,
      })) ?? [];

  const { setValue, watch } = useFormContext<FormValues>();

  const edrpou = watch("edrpou");
  const short_name = watch("short_name");

  const selectedId = watch("partner_account_number_id");

  // Находим выбранный счет по ID
  const selectedAccount = currentAccountList?.find((a) => a.id === selectedId);
  const bankAccount = selectedAccount?.bank_account;

  // 🔥 Сброс и автозаполнение при смене edrpou или short_name
  useEffect(() => {
     if (!edrpou && !short_name) {
      setValue("partner_account_number_id", null);
      setValue("selectedAccount", "");
      setValue("mfo", "");
      setValue("bank_name", "");
      return;
    }

    // ⬇️ Смотрим, не выставлен ли id уже (после reset или выбора пользователем)
    if (
      selectedId !== undefined &&
      selectedId !== null &&
      currentAccountList.some((a) => a.id === selectedId)
    ) {

      return;
    }

    // Иначе ставим дефолтный (или первый)
    const defaultAccount = currentAccountList.find((a) => a.is_default);

    if (defaultAccount) {
      setValue("partner_account_number_id", defaultAccount.id);
      setValue("selectedAccount", defaultAccount.bank_account);
      setValue("mfo", defaultAccount.mfo ?? "");
      setValue("bank_name", defaultAccount.bank_name ?? "");
    } else {
      setValue("partner_account_number_id", null);
      setValue("selectedAccount", "");
      setValue("mfo", "");
      setValue("bank_name", "");
    }
  }, [
    edrpou,
    short_name,
    currentAccountList,
    selectedId,
    setValue,
  ]);

  // Автозаполнение MFO и bank_name при смене счета
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
    setValue("mfo", selected.mfo || "");
    setValue("bank_name", selected.bank_name || "");
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
