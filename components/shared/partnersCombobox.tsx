import { Combobox } from "@/components/shared";
import { FormValues } from "@/components/shared/paymentForm";
import { apiClient } from "@/services/api-client";
import { PartnersWithAccounts } from "@/services/partners";
import React from "react";
import { Control } from "react-hook-form";

type Props = {
  control: Control<FormValues>;
  id: number | undefined;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  placeholder: string;
  empty: string;
  handleChange: (id: PartnersWithAccounts) => void;
};

const PartnersCombobox: React.FC<Props> = ({
  id,
  control,
  name,
  label,
  description,
  placeholder,
  empty,
  handleChange,
}) => {
  const [partnersList, setPartnersList] = React.useState<
    PartnersWithAccounts[]
  >([]);
  const [list, setList] = React.useState<{ key: string; value: string }[]>([]);

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

    const onChange = (i: number) => {
      const partner = partnersList[i];
      handleChange(partner);
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
