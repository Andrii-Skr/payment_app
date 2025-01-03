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

type PaymentsKeys = `payments.${number}.${  "paySum"}`;
type TopLevelKeys = keyof Omit<FormValues, "date" | "accountsList" | "payments">;

type Props = {
  control: Control<FormValues>;
  name: PaymentsKeys | TopLevelKeys;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number";
  className?: string;
};

const FormInput: React.FC<Props> = ({
  control,
  name,
  label,
  placeholder,
  description,
  type,
  className
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
              className={className}
              type={type}
              placeholder={placeholder}
              {...field}
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
