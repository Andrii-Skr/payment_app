import React from "react";
import {
  EdrpouCombobox,
  AccountsCombobox,
  PartnersCombobox,
  AddPartner,
  ContainerGrid,
  ComputedFormInput,
} from "@/components/shared";
import { Control, useWatch } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { useDocumentsStore } from "@/store/documentsListStore";

type Props = {
  control: Control<FormValues>;
  entityIdNum: number;
};

export const PartnerBlock: React.FC<Props> = ({ control, entityIdNum }) => {
  const partnerId = useWatch({ control, name: "partner_id" });
  const entityId = useWatch({ control, name: "entity_id" });
  const remainder = useDocumentsStore((s) =>
    s.getRemainder(Number(entityId), Number(partnerId))
  );

  return (
    <div className="w-auto rounded-3xl border-gray-400 border-2 ml-[-20px] p-3 space-y-1">
      <ContainerGrid className="">
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
          className="bank-account-size"
          empty="Счета не найдены =("
          label="Номер счета"
          placeholder="Выберите номер счета..."
        />
        <AddPartner
          entityIdNum={entityIdNum}
          className="self-end justify-start"
        />
      </ContainerGrid>

      <ContainerGrid className="">
        <PartnersCombobox
          control={control}
          name="short_name"
          label="Имя контрагента"
          empty="Контрагенты не найдены =("
          placeholder="Выберите Контрагента..."
          id={entityIdNum}
        />
        <ComputedFormInput label="Сальдо" value={remainder} className="mt-[-6px]" tabIndex={-1}/>
        {/* <FormInput
          control={control}
          className="no-spin"
          name="mfo"
          label="МФО"
          type="text"
          readOnly
        /> */}
        {/* <FormInput
          control={control}
          className="no-spin"
          name="bank_name"
          label="Название банка"
          type="text"
          readOnly
        /> */}
      </ContainerGrid>
    </div>
  );
};
