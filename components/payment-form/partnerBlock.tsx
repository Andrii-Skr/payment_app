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
  const payments = useWatch({ control, name: "payments" });
  const accountSum = useWatch({ control, name: "accountSum" });
  const docId = useWatch({ control, name: "doc_id" });

  const hasPaid = payments?.some((p) => p?.isPaid);
  const docs = useDocumentsStore((s) => s.docs);
  const remainder = useDocumentsStore((s) =>
    s.getRemainder(Number(entityId), Number(partnerId))
  );

  const paySumTotal = (payments || []).reduce(
    (acc: number, curr: any) => acc + (Number(curr.paySum) || 0),
    0
  );

  const savedDoc = docs.find((d) => d.id === Number(docId));
  const savedAccountSum = savedDoc ? Number(savedDoc.account_sum) : 0;
  const savedPaySum = savedDoc
    ? savedDoc.spec_doc.reduce((s, spec) => s + Number(spec.pay_sum), 0)
    : 0;
  const accountSumNum = Number(String(accountSum).replace(/,/g, ".")) || 0;

  const computedRemainder = Number(
    (
      remainder +
      savedPaySum -
      paySumTotal +
      accountSumNum -
      savedAccountSum
    ).toFixed(2)
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
          disabled={hasPaid}
        />
        <AccountsCombobox
          control={control}
          name="selectedAccount"
          className="bank-account-size"
          empty="Счета не найдены =("
          label="Номер счета"
          placeholder="Выберите номер счета..."
          disabled={hasPaid}
        />
        <AddPartner
          entityIdNum={entityIdNum}
          className="self-end justify-start"
          disabled={hasPaid}
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
          disabled={hasPaid}
        />
        <ComputedFormInput
          label="Сальдо"
          value={computedRemainder}
          className="mt-[-6px]"
          tabIndex={-1}
        />
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
