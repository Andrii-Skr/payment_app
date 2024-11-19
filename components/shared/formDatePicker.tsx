"use client"
import { DatePicker } from '@/components/shared/datePicker';
import { FormValues } from '@/components/shared/paymentForm';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui'
import React from 'react'
import { Control } from 'react-hook-form';

type Props = {
  control: Control<FormValues>,
  name: keyof Pick<FormValues, "expectedDate" | "deadLineDate" | "date">,
  label: string,
  description?: string
  value: Date | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
};

const FormDatePicker:React.FC<Props> = ({ control, name,label,description,value,onChange}) => {
    return (
        <FormField
            control={control}
            name={name}
            render={( {field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <FormControl>
            <DatePicker selected={value} onChange={onChange}/>
            </FormControl>
             <FormDescription>
                    {description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
          />
  )
}

export { FormDatePicker }
