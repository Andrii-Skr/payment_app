"use client"

import * as React from "react"
import { partner_account_number, partners } from "@prisma/client"
import { Control } from "react-hook-form"
import { FormValues } from "@/components/shared/paymentForm"
import { Combobox } from "@/components/ui"


type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string,
  description?: string
  id?: number | undefined
  placeholder: string
  empty: string

};

export const SampleCombobox:React.FC<Props> =({  id , name, label, description, control,placeholder,empty}  ) =>{

  const [list, setList] = React.useState<{ key: string; value: string }[]>([]);

  const onChange = (i: number) => { }

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
  )
}
