import type { TemplateWithBankDetails } from "@api/templates/[id]/route";
import { CirclePlus } from "lucide-react";
import type React from "react";
import type { Control } from "react-hook-form";
import { ContainerGrid, SampleCombobox } from "@/components/shared";
import { Button } from "@/components/ui/button";
import type { FormValues } from "@/types/formTypes";

type Props = {
  control: Control<FormValues>;
  templatesList: TemplateWithBankDetails[];
  onSampleChange: (index: number) => void;
  onSaveClick: () => void;
};

export const TemplateSelector: React.FC<Props> = ({ control, templatesList, onSampleChange, onSaveClick }) => (
  <ContainerGrid className="">
    <SampleCombobox
      control={control}
      name="sample"
      label="Шаблон"
      placeholder="Выберите шаблон ..."
      empty="Шаблоны не найдены =("
      data={templatesList}
      onChange={onSampleChange}
    />
    <Button
      type="button"
      tabIndex={-1}
      className="justify-start self-end"
      size={"sm"}
      variant="ghost"
      onClick={onSaveClick}
    >
      <CirclePlus className="mr-2" />
      Добавить / Изменить шаблон
    </Button>
  </ContainerGrid>
);
