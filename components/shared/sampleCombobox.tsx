// SampleCombobox.tsx
import * as React from "react";
import { Control } from "react-hook-form";
import { template } from "@prisma/client";
import { Combobox } from "@/components/ui";
import { FormValues } from "@/components/shared/paymentForm";

type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  description?: string;
  id?: number;
  placeholder: string;
  empty: string;
  data: template[];
  onChange: (id: number) => void;
};

export const SampleCombobox: React.FC<Props> = ({
  id,
  name,
  label,
  description,
  control,
  placeholder,
  empty,
  data,
  onChange
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
      id={id}
      list={list}
    />
  );
};
