"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormField, FormItem, FormLabel } from "@/components/ui"
import { Container } from "@/components/shared"
import { apiClient } from "@/services/api-client"
import { partner_account_number, partners } from "@prisma/client"
import { Control } from "react-hook-form"
import { FormValues } from "@/components/shared/paymentForm"
import { PartnersWithAccounts } from "@/services/partners"
// import { useFormStore } from "@/store/store"

type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string,
  description?: string
  id?: number | undefined
  placeholder: string
  emty: string
  data?: partner_account_number[]
  onChange?: (edrpouList: partner_account_number) => void
};

export const AccountsCombobox:React.FC<Props> =({  id ,onChange, name, label, description, control,placeholder,emty,data}  ) =>{
  const [open, setOpen] = React.useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <Container className="flex flex-col space-y-2">
          <FormItem className="flex flex-col content-between">
            <FormLabel >{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen} >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[220px] h-9 px-3 py-1 justify-between"
                >
                  {field.value
                    ? data?.find((accountList) => accountList.account_number === field.value)?.account_number
                    : placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput placeholder={placeholder} />
                  <CommandList>
                    <CommandEmpty>{emty}</CommandEmpty>
                    <CommandGroup>
                      {data?.map((accountList) => (
                        <CommandItem
                          key={accountList.account_number}
                          value={accountList.account_number}
                          onSelect={(currentValue) => {
                            field.onChange(currentValue === field.value ? "" : currentValue)
                            //onChange(edrpouList)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === accountList.account_number ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {accountList.account_number}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormItem>
        </Container>
      )}
      />
  )
}
