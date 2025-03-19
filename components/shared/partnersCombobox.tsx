import { Combobox } from "@/components/shared";
import { FormValues } from "@/components/shared/paymentForm";
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

const PartnersCombobox: React.FC<Props> = ({
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
  const edrpou = watch("edrpou");

  React.useEffect(() => {
    if (!id) return;
    apiClient.partners.partnersService(id).then((data) => {
      setList(
        data
          ? data.map((e) => {
              return { key: String(e.id), value: e.edrpou };
            })
          : []
      );
      setPartnersList(data ? data : []);
    });
  }, [id]);



  React.useEffect(() => {
    const partner = partnersList.find((p) => p.edrpou === edrpou);
    if (partner) {
      updateAccountList(partner.partner_account_number);
    }
  }, [edrpou, partnersList]);

    const onChange = (i: number) => {
      const partner = partnersList[i];
      setValue("partner_id", partner.id);
      setValue("partnerName", partner.name);
    }
  return (
    <Combobox
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      empty={empty}
      onChange={onChange}
      id={id}
      list={list}
    />
  );
};

export { PartnersCombobox };


