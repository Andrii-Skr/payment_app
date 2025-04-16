"use client";
import { Combobox } from "@/components/shared";
import { FormValues } from "@/types/formTypes";
import { apiClient } from "@/services/api-client";
import { PartnersWithAccounts } from "@/services/partners";
import { useAccountListStore } from "@/store/store";
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
  const [partnersList, setPartnersList] = React.useState<
    PartnersWithAccounts[]
  >([]);
  const [list, setList] = React.useState<{ key: string; value: string }[]>([]);
  const updateAccountList = useAccountListStore((state ) => state.updateAccountList);

  const { setValue, watch } = useFormContext();
  const partnerName = watch("partnerName");

  React.useEffect(() => {
    if (!id) return;
    apiClient.partners.partnersService(id).then((data) => {
      setList(
        data
          ? data.map((e) => {
              return { key: String(e.id), value: e.name };
            })
          : []
      );
      setPartnersList(data ? data : []);
    });
  }, [id]);



  React.useEffect(() => {
    const partner = partnersList.find((p) => p.name === partnerName);
    if (partner) {
      updateAccountList(partner.partner_account_number);
    }
  }, [partnerName, partnersList]);

    const onChange = (i: number) => {
      const partner = partnersList[i];
      setValue("partner_id", partner.id);
      setValue("edrpou", partner.edrpou);
    }
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



