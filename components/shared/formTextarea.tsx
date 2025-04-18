import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { cn } from "@/lib/utils";

type PaymentsKeys = `payments.${number}.${"paySum"}`;
type TopLevelKeys = keyof Omit<
  FormValues,
  "date" | "accountsList" | "payments" | "is_auto_payment" | "vatType">;

type Props = {
  control: Control<FormValues>;
  name: PaymentsKeys | TopLevelKeys;
  label: string;
  placeholder?: string;
  description?: string;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const FormTextarea: React.FC<Props> = ({
  control,
  name,
  label,
  placeholder,
  description,
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
            <Textarea
              className={cn("w-[250px] min-h-[78px] p-2 rounded-lg", className)}
              placeholder={placeholder}
              {...field}
              {...rest}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { FormTextarea };
