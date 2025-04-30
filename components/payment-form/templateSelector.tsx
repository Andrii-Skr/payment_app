import React from "react";
import { Container, SampleCombobox } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
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
  <Container className="justify-start items-start gap-5">
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
      className="mt-[18px]"
      variant="ghost"
      onClick={onSaveClick}
    >
      <Save className="mr-2" /> Сохранить шаблон
    </Button>
  </Container>
);
