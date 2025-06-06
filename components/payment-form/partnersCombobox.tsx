"use client";
import { Combobox } from "@/components/shared";
import { FormValues } from "@/types/formTypes";
import { useAccountListStore } from "@/store/store";
import { usePartnersStore } from "@/store/partnersStore";
import React from "react";
import { Control, useFormContext } from "react-hook-form";

type Props = {
  control: Control<FormValues>;
  id: number | undefined;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  placeholder: string;
  empty: string;
};

export const PartnersCombobox: React.FC<Props> = ({
  id,
  control,
  name,
  label,
  description,
  placeholder,
  empty,
}) => {
  const { partners, fetchPartners } = usePartnersStore();
  const updateAccountList = useAccountListStore((s) => s.updateAccountList);
  const { setValue, watch } = useFormContext();
  const partnerName = watch("short_name");

  React.useEffect(() => {
    if (id) fetchPartners(id);
  }, [id]);

  React.useEffect(() => {
    const partner = partners.find((p) => p.short_name === partnerName);
    if (partner) {
      updateAccountList(partner.partner_account_number);
     } else {
      updateAccountList([]);
    }
  }, [partnerName, partners]);

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
    />
  );
};
