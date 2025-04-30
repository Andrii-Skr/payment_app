"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SaveTemplateDialog,
  ReplaceTemplateDialog,
  SumAndDateForm,
  AsidePaymentForm,
} from "@/components/shared";
import { formSchema, FormValues } from "@/types/formTypes";
import { usePaymentFormLogic } from "@/lib/hooks/usePaymentFormLogic";
import { useTemplateManager } from "@/lib/hooks/useTemplateManager";
import { parseExpression } from "@/lib/math/parseExpression";
import { TransformedObject } from "@/lib/transformData/doc";

import {
  TemplateSelector,
  AccountDetailsForm,
  PurposeAndNoteForm,
  PartnerBlock,
} from "@/components/payment-form";
import { apiClient } from "@/services/api-client";

const defaultValues: FormValues = {
  doc_id: undefined,
  entity_id: undefined,
  partner_account_number_id: undefined,
  sample: "",
  accountNumber: "",
  accountSum: "0",
  vatType: true,
  vatPercent: 20,
  accountSumExpression: "",
  date: null,
  edrpou: "",
  payments: [
    {
      documents_id: undefined,
      paySum: 0,
      expectedDate: null,
      deadLineDate: null,
      paidDate: null,
    },
  ],
  selectedAccount: "",
  mfo: "",
  bank_name: "",
  partner_id: undefined,
  partnerName: "",
  purposeOfPayment: "",
  note: "",
};

export const PaymentForm: React.FC<{ className?: string }> = ({
  className,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    shouldUnregister: false,
  });

  const { setValue, getValues, reset, control, watch, handleSubmit } = form;

  // const partner_id = watch("partner_id");

  const {
    entity,
    docs,
    templatesList,
    entityIdNum,
    onSubmit,
    selectedTemplate,
    isTemplateDialogOpen,
    isReplaceDialogOpen,
    setTemplateDialogOpen,
    setIsReplaceDialogOpen,
    setSelectedTemplate,
    setTemplatesList,
  } = usePaymentFormLogic({ reset, setValue, getValues, defaultValues });

  const { handleSampleChange, handleSaveTemplate, confirmTemplateReplace } =
    useTemplateManager({ reset, getValues, entityIdNum, setTemplatesList });

  const handleAccountSumBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith("=")) {
      setValue("accountSumExpression", value);
      const result = parseExpression(value);
      setValue("accountSum", result);
    } else {
      const clean = value.replace(/,/g, ".");
      const num = Number(clean);
      setValue("accountSum", !isNaN(num) ? num.toFixed(2) : clean);
    }
  };

  const handleAccountSumDoubleClick = () => {
    const expr = getValues("accountSumExpression");
    if (expr) setValue("accountSum", expr);
  };

  const handleDocRowClick = async (docId: number) => {
    const data = await apiClient.documents.getById(docId);
    if (data != null) {
      reset(TransformedObject(data));
    }
  };

  return (
    <div className="flex flex-row justify-around">
      <AsidePaymentForm docs={docs} onRowClick={handleDocRowClick} />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1 w-auto">
          <Alert className="p-2">
            <AlertDescription className="w-auto p-0">
              Наименование Плательщика: {entity?.name || "Загрузка..."}
            </AlertDescription>
          </Alert>

          <TemplateSelector
            control={control}
            templatesList={templatesList}
            onSampleChange={(i) =>
              handleSampleChange(
                i,
                templatesList,
                setSelectedTemplate,
                setIsReplaceDialogOpen
              )
            }
            onSaveClick={() => setTemplateDialogOpen(true)}
          />

          <AccountDetailsForm
            control={control}
            onBlur={handleAccountSumBlur}
            onDoubleClick={handleAccountSumDoubleClick}
          />

          <PurposeAndNoteForm />

          <PartnerBlock control={control} entityIdNum={entityIdNum} />

          <SumAndDateForm control={control} />
        </form>
      </Form>

      <SaveTemplateDialog
        open={isTemplateDialogOpen}
        setOpen={setTemplateDialogOpen}
        onSave={(sample) => handleSaveTemplate(sample, setValue)}
        initialSample=""
      />

      <ReplaceTemplateDialog
        open={isReplaceDialogOpen}
        name={getValues("sample")}
        onOpenChange={(open) => {
          setIsReplaceDialogOpen(open);
          if (!open) setSelectedTemplate(null);
        }}
        onConfirm={() => {
          if (selectedTemplate) {
            reset(confirmTemplateReplace(selectedTemplate));
          }
        }}
      />
    </div>
  );
};
