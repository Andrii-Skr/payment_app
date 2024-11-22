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
import { partners } from "@prisma/client"
import { Control } from "react-hook-form"
import { FormValues } from "@/components/shared/paymentForm"
import { PartnersWithAccounts } from "@/services/partners"
// import { useFormStore } from "@/store/store"

type Props = {
  control: Control<FormValues>;
  name: keyof Omit<FormValues, "expectedDate" | "deadLineDate" | "date">;
  label: string,
  description?: string
  id: number | undefined
  placeholder: string
  emty: string
  onChange: (edrpouList: PartnersWithAccounts) => void
};

export const Combobox:React.FC<Props> =({  id ,onChange, name, label, description, control,placeholder,emty}  ) =>{
  const [open, setOpen] = React.useState(false)
  const [partnersList, setPartnersList] = React.useState<PartnersWithAccounts[] | undefined>([]);



  React.useEffect(() => {
    if(!id) return
    apiClient.partners.partnersService(id).then((data) => {
      setPartnersList(data);
      console.log(`data ${data}`);
    });
  }, [open]);

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
                    ? partnersList?.find((partnersList) => partnersList.edrpou === field.value)?.edrpou
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
                      {partnersList?.map((edrpouList) => (
                        <CommandItem
                          key={edrpouList.edrpou}
                          value={edrpouList.edrpou}
                          onSelect={(currentValue) => {
                            field.onChange(currentValue === field.value ? "" : currentValue)
                            onChange(edrpouList)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === edrpouList.edrpou ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {edrpouList.edrpou}
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
