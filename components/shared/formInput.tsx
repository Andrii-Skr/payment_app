import { InfoFormValues } from "@/types/infoTypes";
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
import { Control, FieldValues, Path } from "react-hook-form";

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number" | "password";
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type,
  className,
  ...rest
}: FormInputProps<T>) => {
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
