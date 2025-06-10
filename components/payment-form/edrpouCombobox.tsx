"use client";
import { Combobox } from "@/components/shared";
import { FormValues } from "@/types/formTypes";
import { useAccountListStore } from "@/store/accountListStore";
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

export const EdrpouCombobox: React.FC<Props> = ({
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
  const edrpou = watch("edrpou");

  React.useEffect(() => {
    if (id) fetchPartners(id);
  }, [id]);

  React.useEffect(() => {
    const partner = partners.find((p) => p.edrpou === edrpou);

    if (partner) {
      updateAccountList(partner.partner_account_number);
     } else {
      updateAccountList([]);
    }
  }, [edrpou, partners]);

  const onChange = (index: number) => {
    const partner = partners[index];
    setValue("partner_id", partner.id);
    setValue("short_name", partner.short_name);
    setValue("full_name", partner.full_name);
    setValue("edrpou", partner.edrpou);
  };

  const list = partners.map((p) => ({
    key: String(p.id),
    value: p.edrpou,
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
