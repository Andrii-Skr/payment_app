"use client";

import { Alert, AlertDescription, Button, Form } from "@/components/ui";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container } from "@/components/shared/container";
import {
  AccountsCombobox,
  AddPartner,
  AsidePaymentForm,
  EdrpouCombobox,
  FormDatePicker,
  FormInput,
  PartnersCombobox,
  ReplaceTemplateDialog,
  SampleCombobox,
  SaveTemplateDialog,
  SumAndDateForm,
} from "@/components/shared";
import { apiClient } from "@/services/api-client";
import { TransformedObject } from "@/transformData/doc";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { entity, template } from "@prisma/client";
import { Save } from "lucide-react";
import { DocumentWithPartner } from "@/app/api/document/entity/[entity_id]/route";

const paymentSchema = z.object({
  documents_id: z.number().optional(),
  paySum: z.preprocess((value) => {
    if (typeof value === "string") {
      value = value.replace(/,/g, ".");
    }
    return value === "" ? 0 : Number(value);
  }, z.number().min(0.1, "Сумма должна быть больше 0")),
  isPaid: z.boolean().optional(),
  paidDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.union([z.date(), z.null()]).optional()),
  expectedDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.union([z.date(), z.null()]).optional()),
  deadLineDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.union([z.date(), z.null()]).optional()),
});

const formSchema = z.object({
  doc_id: z.number().optional(),
  entity_id: z.number(),
  partner_id: z.number(),
  sample: z.string().optional(),
  accountNumber: z
    .string({ message: "Пожалуйста, заполните это поле" })
    .min(2, { message: "Номер счета должен быть не менее 2 символов." }),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.union([z.date({ message: "Пожалуйста, выберите дату" }), z.null()])),
  accountSum: z
    .string()
    .regex(/^(=)?[0-9,\-+*/().\s]+$/, "Сумма должна состоять только из цифр"),
  accountSumExpression: z.string().optional(),
  payments: z.array(paymentSchema),
  edrpou: z.string().length(8, { message: "ЕДРПОУ должен быть 8 цифр" }),
  selectedAccount: z.string().nonempty("Выберите номер счета"),
  mfo: z.string(),
  partnerName: z.string(),
  purposeOfPayment: z.string().max(420, {
    message: "Примечание должно быть не более 420 символов.",
  }),
  note: z.string().optional(),
  is_auto_payment: z.boolean().optional(),
});

export type PaymentValues = z.infer<typeof paymentSchema>;
export type FormValues = z.infer<typeof formSchema>;

type Props = {
  className?: string;
};

export const PaymentForm: React.FC<Props> = ({ className }) => {
  const { entity_id } = useParams();
  const entityIdNum = Number(entity_id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const docIdQuery = searchParams.get("doc_id");

  const [entity, setEntity] = React.useState<entity | null>(null);
  // const [accountList, setAccountList] = React.useState<
  //   partner_account_number[]
  // >([]);
  const [templatesList, setTemplatesList] = React.useState<template[]>([]);
  const [docs, setDocs] = React.useState<DocumentWithPartner[]>([]);


  // Состояние для диалога сохранения шаблона
  const [isTemplateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  // Состояния для диалога замены данных при выборе шаблона
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<template | null>(null);

  const defaultValues: FormValues = {
    doc_id: undefined,
    entity_id: entityIdNum,
    sample: "",
    accountNumber: "",
    accountSum: "0",
    date: null,
    accountSumExpression: "",
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
    partner_id: 0,
    partnerName: "",
    purposeOfPayment: "",
    note: "",
    mfo: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    shouldUnregister: false,
  });
  const { setValue, reset, watch, getValues } = form;
  const partner_id = watch("partner_id");

  // Загрузка данных сущности и шаблонов
  React.useEffect(() => {
    if (entityIdNum) {
      apiClient.entity.getEntityById(entityIdNum).then((data) => {
        if (data) setEntity(data);
      });
      apiClient.document.getTemplateById(entityIdNum).then((data) => {
        if (data) setTemplatesList(data);
      });
    }
  }, [entityIdNum]);

  // Установка entity_id в форме
  React.useEffect(() => {
    setValue("entity_id", entityIdNum);
  }, [entityIdNum, setValue]);

  // Загрузка списка документов
  React.useEffect(() => {
    if (entityIdNum) {
      apiClient.document.getByEntity(entityIdNum).then((data) => {
        if (data) setDocs(data);
      });
    }
  }, [entityIdNum, partner_id]);

  // Если передан doc_id в URL, загрузка документа и обновление формы
  React.useEffect(() => {
    if (docIdQuery) {
      const docIdNumber = Number(docIdQuery);
      apiClient.document.getById(docIdNumber).then((data) => {
        if (data) {
          const transformedData = TransformedObject(data);
          reset(transformedData);
        }
      });
    }
  }, [docIdQuery, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!data.doc_id) {
      await apiClient.document.create(data);
      const updatedDocs = await apiClient.document.getByEntity(entityIdNum);
      if (updatedDocs) setDocs(updatedDocs);
    } else {
      await apiClient.document.update(data);
      router.push(`/create/payment-form/${entityIdNum}`);
    }
    reset({ ...defaultValues, entity_id: entityIdNum });
  };

  const handleAccountSumBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.startsWith("=")) {
      value = value.replace(/,/g, ".");
      setValue("accountSumExpression", value);
      try {
        const expr = value.slice(1);
        const result = new Function("return " + expr)();
        const rounded = Number(result).toFixed(2);
        setValue("accountSum", rounded);
      } catch (error) {
        console.error("Ошибка при вычислении выражения", error);
      }
    } else {
      const newValue = value.replace(/,/g, ".");
      const num = Number(newValue);
      if (!isNaN(num)) {
        setValue("accountSum", num.toFixed(2));
      } else {
        setValue("accountSum", newValue);
      }
    }
  };

  const handleAccountSumDoubleClick = (
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    const expression = getValues("accountSumExpression");
    if (expression) setValue("accountSum", expression);
  };

  // Обработка сохранения шаблона
  const handleSaveTemplate = async (sampleValue: string) => {
    setValue("sample", sampleValue);
    const formData = getValues();
    if (partner_id) {
      const { payments, ...dataToSend } = formData;
      console.log(dataToSend);
      await apiClient.document.createTemplate(
        //@ts-ignore
        dataToSend as Omit<FormValues, "payments">
      );
    }
    apiClient.document.getTemplateById(entityIdNum).then((data) => {
      if (data) setTemplatesList(data);
    });
  };

  // Обработка выбора шаблона из Combobox
  const handleSampleChange = (i: number) => {
    const foundTemplate = templatesList[i];

    if (foundTemplate) {
      setSelectedTemplate(foundTemplate);
      setIsReplaceDialogOpen(true);
    }
  };

  const handleDocRowClick = (docId: number) => {
    apiClient.document.getById(docId).then((data) => {
      if (data) {
        const transformedData = TransformedObject(data);
        reset(transformedData);
      }
    });
  };

  return (
    <div className="flex flex-row justify-around">
      <AsidePaymentForm docs={docs} onRowClick={handleDocRowClick} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Валидация не пройдена:", errors);
          })}
          className="space-y-1 w-auto"
        >
          <Alert>
            <AlertDescription className="w-auto p-1">
              Наименование Плательщика: {entity?.name || "Загрузка..."}
            </AlertDescription>
          </Alert>
          <Container className="justify-start items-start gap-5">
            <SampleCombobox
              control={form.control}
              name="sample"
              label="Шаблон"
              placeholder="Выберите шаблон ..."
              empty="Шаблоны не найдены =("
              data={templatesList}
              onChange={handleSampleChange}
            />
            <Button
              type="button"
              className="mt-[18px]"
              variant="ghost"
              onClick={() => setTemplateDialogOpen(true)}
            >
              <Save className="mr-2" /> Сохранить шаблон
            </Button>
          </Container>
          <Container className="justify-start items-start gap-5">
            <FormInput
              control={form.control}
              className="no-spin"
              type="text"
              name="accountSum"
              label="Сумма счета"
              description="Сумма, указанная в счете"
              onBlur={handleAccountSumBlur}
              onDoubleClick={handleAccountSumDoubleClick}
            />
            <FormInput
              control={form.control}
              name="accountNumber"
              label="Номер счета"
              placeholder="Введите номер счета"
              description="Номер, указанный в счете"
            />
            <FormDatePicker
              control={form.control}
              name="date"
              label="Дата счета"
              description="Дата, указанная в счете"
            />
          </Container>
          <Container className="justify-start items-start gap-5">
            <FormInput
              control={form.control}
              name="purposeOfPayment"
              label="Назначение платежа"
              placeholder=""
              description="Назначение платежа"
            />
            <FormInput
              control={form.control}
              name="note"
              label="Комментарий к платежу"
              placeholder=""
              description="Комментарий к счету"
            />
          </Container>
          <div className="w-auto rounded-3xl border-gray-200 border-2 ml-[-20px] p-3">
            <Container className="justify-start gap-5 pb-2">
              <EdrpouCombobox
                control={form.control}
                name="edrpou"
                label="ЕДРПОУ"
                placeholder="Выберите ЕДРПОУ..."
                empty="ЕДРПОУ не найдены =("
                id={entityIdNum}
              />
              <AccountsCombobox
                control={form.control}
                name="selectedAccount"
                label="Номер счета"
                placeholder="Выберите номер счета..."
                empty="Номера счетов не найдены =("
              />
              <AddPartner entityIdNum={entityIdNum} className="self-end" />
            </Container>
            <Container className="justify-start gap-5">
              <PartnersCombobox
                control={form.control}
                name="partnerName"
                label="Имя контрагента"
                placeholder="Выберите Контрагента..."
                empty="Контрагенты не найдены =("
                id={entityIdNum}
              />
              <FormInput
                control={form.control}
                className="no-spin"
                name="mfo"
                label="МФО"
                type="number"
              />
            </Container>
          </div>
          <SumAndDateForm control={form.control} />
        </form>
      </Form>

      {/* Диалог сохранения шаблона */}
      <SaveTemplateDialog
        open={isTemplateDialogOpen}
        setOpen={setTemplateDialogOpen}
        onSave={handleSaveTemplate}
        initialSample={""}
      />

      {/* Диалог подтверждения замены данных при выборе шаблона */}
      <ReplaceTemplateDialog
        open={isReplaceDialogOpen}
        name={getValues("sample")}
        onOpenChange={(open: boolean) => {
          setIsReplaceDialogOpen(open);
          if (!open) setSelectedTemplate(null);
        }}
        onConfirm={() => {
          if (selectedTemplate) {
            reset({
              ...defaultValues,
              entity_id: selectedTemplate.entity_id,
              partner_id: selectedTemplate.partner_id,
              accountNumber: selectedTemplate.account_number,
              accountSum: String(selectedTemplate.account_sum),
              date: selectedTemplate.date,
              purposeOfPayment: selectedTemplate.purpose_of_payment,
              note: selectedTemplate.note || "",
              edrpou: selectedTemplate.edrpou,
              mfo: selectedTemplate.mfo,
              partnerName: selectedTemplate.partner_name,
              selectedAccount: selectedTemplate.bank_account,
            });
          }
        }}
      />
    </div>
  );
};
