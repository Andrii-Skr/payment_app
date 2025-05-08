import React from "react";
import {
  Container,
  EdrpouCombobox,
  AccountsCombobox,
  PartnersCombobox,
  FormInput,
  AddPartner,
} from "@/components/shared";
import { Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";

type Props = {
  control: Control<FormValues>;
  entityIdNum: number;
};

export const PartnerBlock: React.FC<Props> = ({ control, entityIdNum }) => (
  <div className="w-auto rounded-3xl border-gray-200 border-2 ml-[-20px] p-3">
    <Container className="justify-start gap-5 pb-2">
      <EdrpouCombobox
        control={control}
        name="edrpou"
        label="ЕДРПОУ"
        empty="ЕДРПОУ не найдены =("
        placeholder="Выберите ЕДРПОУ..."
        id={entityIdNum}
      />
      <AccountsCombobox
        control={control}
        name="selectedAccount"
        empty="Счета не найдены =("
        label="Номер счета"
        placeholder="Выберите номер счета..."
      />
      <AddPartner entityIdNum={entityIdNum} className="self-end" />
    </Container>

    <Container className="justify-start items-center gap-5">
      <PartnersCombobox
        control={control}
        name="partnerName"
        label="Имя контрагента"
        empty="Контрагенты не найдены =("
        placeholder="Выберите Контрагента..."
        id={entityIdNum}
      />
      <FormInput
        control={control}
        className="no-spin"
        name="mfo"
        label="МФО"
        type="text"
        readOnly
      />
      <FormInput
        control={control}
        className="no-spin"
        name="bank_name"
        label="Название банка"
        type="text"
        readOnly
      />
    </Container>
  </div>
);
