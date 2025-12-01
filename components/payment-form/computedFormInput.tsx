import type React from "react";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type ComputedFormInputProps = {
  label: string;
  description?: string;
  tabIndex?: number;
  value: number;
  className?: string;
};

export const ComputedFormInput: React.FC<ComputedFormInputProps> = ({
  label,
  description,
  tabIndex,
  value,
  className,
}) => {
  return (
    <FormItem className={cn("", className)}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input type="number" readOnly className="no-spin" value={value} tabIndex={tabIndex} />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
};
