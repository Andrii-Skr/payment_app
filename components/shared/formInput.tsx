import type React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number" | "password";
  className?: string;
  endAdornment?: React.ReactNode;
  inputWrapperClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type,
  className,
  endAdornment,
  inputWrapperClassName,
  ...rest
}: FormInputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className={cn("relative", inputWrapperClassName)}>
            <FormControl>
              <Input className={className} type={type} placeholder={placeholder} {...field} {...rest} />
            </FormControl>
            {endAdornment ? (
              <div className="absolute inset-y-0 right-0 flex items-center pr-0">{endAdornment}</div>
            ) : null}
          </div>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { FormInput };
