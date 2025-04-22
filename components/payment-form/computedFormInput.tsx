import React from "react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";

interface ComputedFormInputProps {
  label: string;
  description?: string;
  value: number;
}

export const ComputedFormInput: React.FC<ComputedFormInputProps> = ({
  label,
  description,
  value,
}) => {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input type="number" readOnly className="no-spin" value={value} />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
};

