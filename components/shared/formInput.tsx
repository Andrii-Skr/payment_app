import { FormValues } from "@/components/shared/paymentForm";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import React from "react";
import { Control } from "react-hook-form";

type Props = {
  // control: Control<Omit<FormValues, "expectedDate" | "deadLineDate" | "date">>,
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number";
};

const FormInput: React.FC<Props> = ({
  control,
  name,
  label,
  placeholder,
  description,
  type
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              //value={field.value}

            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { FormInput };
