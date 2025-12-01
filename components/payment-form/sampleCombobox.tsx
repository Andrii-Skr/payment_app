import type { TemplateWithBankDetails } from "@api/templates/[id]/route";
import type * as React from "react";
import type { Control } from "react-hook-form";
import { Combobox } from "@/components/ui";
import type { FormValues } from "@/types/formTypes";

type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  id?: number;
  placeholder: string;
  empty: string;
  data: TemplateWithBankDetails[];
  onChange: (id: number) => void;
};

export const SampleCombobox: React.FC<Props> = ({
  name,
  label,
  description,
  control,
  placeholder,
  empty,
  data,
  onChange,
}) => {
  const list = data.map((e) => ({ key: String(e.id), value: e.name }));

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
