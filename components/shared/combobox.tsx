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

const edrpouList = [
  {
    value: "012345678",
    label: "012345678",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

export function Combobox() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

    return (
   <Container className="flex flex-col space-y-2">
    <FormItem className="flex flex-col">
      <FormLabel>ЕДРПОУ</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          >
          {value
            ? edrpouList.find((edrpouList) => edrpouList.value === value)?.label
            : "Выберите ЕДРПОУ..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Выберите ЕДРПОУ..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {edrpouList.map((edrpouList) => (
                <CommandItem
                key={edrpouList.value}
                value={edrpouList.value}
                onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                }}
                    >
                  <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        value === edrpouList.value ? "opacity-100" : "opacity-0"
                    )}
                    />
                  {edrpouList.label}
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
