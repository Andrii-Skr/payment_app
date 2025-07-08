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
import { cn } from "@/lib/utils";

import {
  TemplateSelector,
  AccountDetailsForm,
  PurposeAndNoteForm,
  PartnerBlock,
} from "@/components/payment-form";

/* ---------- default values ---------- */
const defaultValues: FormValues = {
  doc_id: null,
  entity_id: null,
  partner_account_number_id: null,
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
      documents_id: null,
      paySum: 0,
      expectedDate: null,
      deadLineDate: null,
      isPaid: false,
      paidDate: null,
      purposeOfPayment: "",
    },
  ],
  selectedAccount: null,
  mfo: "",
  bank_name: "",
  partner_id: null,
  short_name: "",
  full_name: "",
  purposeOfPayment: "",
  note: "",
  is_auto_purpose_of_payment: true,
};

export const PaymentForm: React.FC<{ className?: string }> = ({
  className,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  /* ---------- react-hook-form ---------- */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    shouldUnregister: false,
  });
  const { setValue, getValues, reset, control, watch, handleSubmit } = form;
  const docId = watch("doc_id");
  const payments = watch("payments");

  const isDeletable = payments.every((p) => !p.isPaid);

  /* ---------- custom hooks ---------- */
  const {
    entity,
    docs,
    templatesList,
    entityIdNum,
    onSubmit,
    fetchDocs,
    selectedTemplate,
    isTemplateDialogOpen,
    isReplaceDialogOpen,
    setTemplateDialogOpen,
    setIsReplaceDialogOpen,
    setSelectedTemplate,
    setTemplatesList,
    isDuplicateDialogOpen,
    setDuplicateDialogOpen,
    pendingDocData,
    setPendingDocData,
  } = usePaymentFormLogic({ reset, setValue, getValues, defaultValues });

  const { handleSampleChange, handleSaveTemplate, confirmTemplateReplace } =
    useTemplateManager({ reset, getValues, entityIdNum, setTemplatesList });

  const { removeDoc } = useDocumentsStore();

  /* ---------- helpers ---------- */
  const handleAccountSumBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith("=")) {
      setValue("accountSumExpression", value);
      setValue("accountSum", parseExpression(value.replace(/,/g, ".")));
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
    if (data) reset(TransformedObject(data));
  };

  const handleConfirmDelete = async () => {
    const id = getValues("doc_id");
    if (!id) {
      toast.error("Документ не выбран");
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await removeDoc(id, entityIdNum);
      reset({ ...defaultValues, entity_id: entityIdNum });
      toast.success("Документ удалён");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при удалении");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <div className={cn('flex flex-row-reverse justify-around', className)}>
      {/* левая панель со списком документов */}
      <AsidePaymentForm docs={docs} onRowClick={handleDocRowClick} />

      {/* основная форма */}
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-1 w-auto min-w-[850px]"
        >
          {/* заголовок с плательщиком */}
          <Alert className="flex justify-between items-center p-2">
            <AlertDescription className="p-0">
              Наименование Плательщика:&nbsp;
              {entity?.short_name || "Загрузка..."}
            </AlertDescription>
            <Button
              type="button"
              variant="ghost"
              className="flex gap-2 h-6 text-red-500 p-0"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!docId || !isDeletable}
              title={
                !docId
                  ? "Документ не выбран"
                  : !isDeletable
                  ? "Документ содержит оплаченные строки"
                  : undefined
              }
            >
              <Trash2 /> Удалить Документ
            </Button>
          </Alert>

          {/* выбор/сохранение шаблона */}
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

          {/* блоки формы */}
          <div className="w-auto rounded-3xl border-gray-400 border-2 ml-[-20px] p-2">

          <AccountDetailsForm
            control={control}
            onBlur={handleAccountSumBlur}
            onDoubleClick={handleAccountSumDoubleClick}
            />
          <PurposeAndNoteForm />
            </div>
          <PartnerBlock control={control} entityIdNum={entityIdNum} />
          <SumAndDateForm control={control} />
        </form>
      </Form>

      {/* ---- модалки ---- */}
      <SaveTemplateDialog
        open={isTemplateDialogOpen}
        setOpen={setTemplateDialogOpen}
        onSave={(sample) => handleSaveTemplate(sample, setValue)}
        initialSample=""
      />

      <ChoiceDialog
        open={isReplaceDialogOpen}
        title="Заменить данные формы?"
        description={`Данные формы будут заменены значениями из шаблона "${getValues(
          "sample"
        )}". Продолжить?`}
        onCancel={() => {
          setIsReplaceDialogOpen(false);
          setSelectedTemplate(null);
        }}
        choices={[
          {
            label: "Заменить",
            onSelect: () => {
              if (selectedTemplate) {
                reset(confirmTemplateReplace(selectedTemplate));
              }
              setIsReplaceDialogOpen(false);
              setSelectedTemplate(null);
            },
          },
        ]}
      />

      {/* удаление документа */}
      <ChoiceDialog
        open={deleteDialogOpen}
        title="Удалить документ"
        description="Вы уверены, что хотите удалить текущий документ?"
        onCancel={() => setDeleteDialogOpen(false)}
        choices={[{ label: "Удалить", onSelect: handleConfirmDelete }]}
      />

      {/* добавление дубликата документа */}
      <ChoiceDialog
        open={isDuplicateDialogOpen}
        title="Документ уже существует"
        description="Документ с такими данными уже есть. Добавить дубликат?"
        onCancel={() => {
          setDuplicateDialogOpen(false);
          setPendingDocData(null);
        }}
        choices={[
          {
            label: "Добавить дубликат",
            onSelect: async () => {
              if (!pendingDocData) return;
              try {
                await apiClient.documents.create({
                  ...pendingDocData,
                  allowDuplicate: true,
                });
                await fetchDocs(entityIdNum);
                toast.success("Дубликат создан.");
                reset({ ...defaultValues, entity_id: entityIdNum });
              } catch {
                toast.error("Ошибка при добавлении дубликата.");
              } finally {
                setDuplicateDialogOpen(false);
                setPendingDocData(null);
              }
            },
          },
        ]}
      />
    </div>
  );
};
