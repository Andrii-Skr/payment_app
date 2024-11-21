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
import { FormItem, FormLabel } from "@/components/ui"
import { Container } from "@/components/shared"
import { apiClient } from "@/services/api-client"
import { partners } from "@prisma/client"
// import { useFormStore } from "@/store/store"

export function Combobox({ value, id ,onChange}: { value: string | undefined,id:number | undefined,onChange: (edrpouList:partners) => void }  ) {
  const [open, setOpen] = React.useState(false)
  const [partnersList, setPartnersList] = React.useState<partners[] | undefined>([]);
  // const updateCurrentFormData = useFormStore((state) => state.updateCurrentFormData);



  React.useEffect(() => {
    if(!id) return
    apiClient.partners.partnersService(id).then((data) => {
      setPartnersList(data);
      console.log(`data ${data}`);
    });
  }, [open]);

  // const handleChangeEdrpou = (currentValue: string) => {
  //   // updateCurrentFormData({ edrpou: currentValue });
  // };

    return (
   <Container className="flex flex-col space-y-2">
    <FormItem className="flex flex-col content-between">
      <FormLabel >ЕДРПОУ</FormLabel>
      <Popover open={open} onOpenChange={setOpen} >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[210px] h-9 px-3 py-1 justify-between"
          >
          {value
            ? partnersList?.find((partnersList) => partnersList.edrpou === value)?.edrpou
            : "Выберите ЕДРПОУ..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[210px] p-0">
        <Command>
          <CommandInput placeholder="Выберите ЕДРПОУ..." />
          <CommandList>
            <CommandEmpty>ЕДРПОУ не найдены =(</CommandEmpty>
            <CommandGroup>
              {partnersList?.map((edrpouList) => (
                <CommandItem
                key={edrpouList.edrpou}
                value={edrpouList.edrpou}
                  onSelect={(currentValue) => {
                    onChange(edrpouList)
                    setOpen(false)
                }}
                    >
                  <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        value === edrpouList.edrpou ? "opacity-100" : "opacity-0"
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
  )
}
