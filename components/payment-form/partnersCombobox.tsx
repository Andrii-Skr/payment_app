"use client";
import React from "react";
import { type Control, useFormContext } from "react-hook-form";
import { Combobox } from "@/components/shared";
import { useAccountListStore } from "@/store/accountListStore";
import { usePartnersStore } from "@/store/partnersStore";
import type { FormValues } from "@/types/formTypes";

type Props = {
  control: Control<FormValues>;
  id: number | undefined;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  placeholder: string;
  empty: string;
  disabled?: boolean;
};

export const PartnersCombobox: React.FC<Props> = ({ id, control, name, label, placeholder, empty, disabled }) => {
  const { partners, fetchPartners } = usePartnersStore();
  const updateAccountList = useAccountListStore((s) => s.updateAccountList);
  const { setValue, watch } = useFormContext();
  const partnerName = watch("short_name");

  React.useEffect(() => {
    if (id) fetchPartners(id);
  }, [id, fetchPartners]);

  React.useEffect(() => {
    const partner = partners.find((p) => p.short_name === partnerName);
    if (partner) {
      updateAccountList(partner.partner_account_number);
    } else {
      updateAccountList([]);
    }
  }, [partnerName, partners, updateAccountList]);

  const onChange = (index: number) => {
    const partner = partners[index];
    setValue("partner_id", partner.id);
    setValue("edrpou", partner.edrpou);
    setValue("full_name", partner.full_name);
  };

  const list = partners.map((p) => ({
    key: String(p.id),
    value: p.short_name,
  }));

  return (
    <Combobox
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      empty={empty}
      onChange={onChange}
      list={list}
      disabled={disabled}
    />
  );
};
