"use client"
import { DatePicker } from '@/components/shared/datePicker';
import { FormValues } from '@/types/formTypes';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui'
import React from 'react'
import { Control, Path } from 'react-hook-form';

type DateKeys = `payments.${number}.${"expectedDate" | "deadLineDate" | "paidDate"}`
type TopLevelDateKeys = keyof Pick<FormValues, "date">;

type Props = {
  control: Control<FormValues>,
  name: DateKeys | TopLevelDateKeys,
  label: string,
  description?: string
  readOnly?: boolean
};

const FormDatePicker: React.FC<Props> = ({ control, name, label, description,readOnly  }) => {

    return (
        <FormField
            control={control}
            name={name}
            render={( {field }) => (
              <FormItem className="flex flex-col justify-between space-y-1">
            <FormLabel className="mt-1 mb-1.5">{label}</FormLabel>
            <FormControl>
                  <DatePicker selected={field.value} onChange={field.onChange} disabled={readOnly} />
            </FormControl>
             <FormDescription className="mb-2">
                    {description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
          />
  )
}

export { FormDatePicker }
