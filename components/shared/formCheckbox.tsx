import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  className?: string;
}

export function FormCheckbox<T extends FieldValues>({ control, name, label, className }: Props<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-center space-x-2 space-y-0", className)}>
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
          </FormControl>
          <FormLabel className="">{label}</FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
