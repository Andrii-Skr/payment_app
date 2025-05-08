import { PartnerValues } from "@/components/payment-form/addPartner";
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

// type Props = {
//   // control: Control<Omit<FormValues, "expectedDate" | "deadLineDate" | "date">>,
//   control: Control<PartnerValues>;
//   name: keyof Omit<PartnerValues, "expectedDate" | "deadLineDate" | "date" | "accList">;
//   label: string;
//   placeholder?: string;
//   description?: string;
//   type?: "text" | "number";
//   className?: string
// };

type AccListKeys = `accList.${number}`;
type TopLevelKeys = keyof Omit<PartnerValues, "accList" | "synonymList">;

type Props = {
  control: Control<PartnerValues>;
  name: TopLevelKeys;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number";
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const PartnerInput: React.FC<Props> = ({
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
