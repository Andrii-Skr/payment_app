import React from "react";
import { ContainerGrid, SampleCombobox } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { TemplateWithBankDetails } from "@api/templates/[id]/route";

type Props = {
  control: Control<FormValues>;
  templatesList: TemplateWithBankDetails[];
  onSampleChange: (index: number) => void;
  onSaveClick: () => void;
};

export const TemplateSelector: React.FC<Props> = ({
  control,
  templatesList,
  onSampleChange,
  onSaveClick,
}) => (
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
      variant="ghost"
      onClick={onSaveClick}
    >
      <CirclePlus className="mr-2" />
          Добавить / Изменить шаблон
    </Button>
  </ContainerGrid>
);
