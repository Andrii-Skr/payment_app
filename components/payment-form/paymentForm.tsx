"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  Form,
  Alert,
  AlertDescription,
  ChoiceDialog,
} from "@/components/ui";
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
import { useDocumentsStore } from "@/store/documentsListStore";
import { apiClient } from "@/services/api-client";
import { toast } from "@/lib/hooks/use-toast";
import { Trash2 } from "lucide-react";

import {
  TemplateSelector,
  AccountDetailsForm,
  PurposeAndNoteForm,
  PartnerBlock,
} from "@/components/payment-form";

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
  date: undefined ,
  edrpou: "",
  payments: [
    {
      documents_id: undefined,
      paySum: 0,
      expectedDate: null,
      deadLineDate: null,
      paidDate: null,
      purposeOfPayment: "",
    },
  ],
  selectedAccount: "",
  mfo: "",
  bank_name: "",
  partner_id: undefined,
  short_name: "",
  full_name: "",
  purposeOfPayment: "",
  note: "",
};

export const PaymentForm: React.FC<{ className?: string }> = ({
  className,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    shouldUnregister: false,
  });

  const { setValue, getValues, reset, control, watch, handleSubmit } = form;
  const docId = watch("doc_id");

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

  const { removeDoc } = useDocumentsStore();

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

  const handleConfirmDelete = async () => {
    const docId = getValues("doc_id");

    if (!docId) {
      toast.error("Документ не выбран");
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await removeDoc(docId, entityIdNum);
      reset({ ...defaultValues, entity_id: entityIdNum });
      toast.success("Документ удалён");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при удалении");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex justify-around">
      <AsidePaymentForm docs={docs} onRowClick={handleDocRowClick} />

      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-1 w-auto min-w-[850px]"
        >
          <Alert className="flex justify-between items-center p-2">
            <AlertDescription className="w-auto p-0">
              Наименование Плательщика: {entity?.short_name || "Загрузка..."}
            </AlertDescription>
            <Button
              type="button"
              variant="ghost"
              className="flex self-end gap-2 h-6 text-red-500 p-0"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!docId}
              title={!docId ? "Документ не выбран" : undefined}
            >
              <Trash2 /> Удалить Документ
            </Button>
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

      <ChoiceDialog
        open={deleteDialogOpen}
        title="Удалить документ"
        description="Вы уверены, что хотите удалить текущий документ?"
        onCancel={() => setDeleteDialogOpen(false)}
        choices={[
          {
            label: "Удалить",
            onSelect: handleConfirmDelete,
          },
        ]}
      />
    </div>
  );
};
