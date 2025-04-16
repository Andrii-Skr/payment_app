import { FormValues } from "@/types/formTypes";
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

type PaymentsKeys = `payments.${number}.${"paySum"}`;
type TopLevelKeys = keyof Omit<
  FormValues,
  "date" | "accountsList" | "payments" | "is_auto_payment" | "vatType"
>;

type Props = {
  control: Control<FormValues>;
  name: PaymentsKeys | TopLevelKeys;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number";
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const FormInput: React.FC<Props> = ({
  control,
  name,
  label,
  placeholder,
  description,
  type,
  className,
  ...rest
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
              {...rest}
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
