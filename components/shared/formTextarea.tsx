import type React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { normalizeTextareaValue } from "@/lib/helpers/normalizeTextareaValue";
import { cn } from "@/lib/utils";

type FormTextareaProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  className,
  ...rest
}: FormTextareaProps<T>) {
  const { onBlur: onBlurProp, onChange: onChangeProp, ...textareaProps } = rest;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
          field.onChange(event);
          onChangeProp?.(event);
        };

        const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
          const normalizedValue = normalizeTextareaValue(event.target.value);

          if (normalizedValue !== event.target.value) {
            event.target.value = normalizedValue;
            field.onChange(normalizedValue);
          }

          field.onBlur();
          onBlurProp?.(event);
        };

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Textarea
                className={cn("p-2 rounded-lg", className)}
                placeholder={placeholder}
                {...textareaProps}
                {...field}
                value={(field.value ?? "") as string}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
