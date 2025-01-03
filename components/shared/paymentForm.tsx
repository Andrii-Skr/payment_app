"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Form,
  FormLabel,
} from "@/components/ui";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container } from "@/components/shared/container";
import {
  AccountsCombobox,
  AddPartner,
  FormDatePicker,
  FormInput,
  PartnersCombobox,
  SampleCombobox,
  SumAndDateForm,
} from "@/components/shared";
import { useEntityStore } from "@/store/store";
import { partner_account_number } from "@prisma/client";
import { PartnersWithAccounts } from "@/services/partners";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/api-client";

const paymentSchema = z.object({
  // accountSum: z.preprocess(
  //   (value) => (value === "" ? undefined : Number(value)),
  //   z.number().min(0.1, "Сумма должна быть больше 0")),
  paySum: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().min(0.1, "Сумма должна быть больше 0")),
  expectedDate: z.date({ required_error: "Выберите желаемую дату оплаты" }).optional(),
  deadLineDate: z.date({ required_error: "Выберите крайний срок оплаты" }).optional(),
});


const formSchema = z.object({
  entity_id: z.number(),
  partner_id: z.number(),
  sample: z
    .string()
    .optional(),
  accountNumber: z
    .string({ message: "Пожалуйста, заполните это поле" })
    .min(2, {
      message: "Номер счета должен быть не менее 2 символов.",
    }),

  date: z.date({ message: "Пожалуйста, выберите дату" }),
  accountSum: z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number().min(0.1, "Сумма должна быть больше 0")),

  payments: z
    .array(paymentSchema),

  edrpou: z.string().length(8, {
    message: "ЕДРПОУ должен быть 8 цифр",
  }),
  selectedAccount: z.string().nonempty("Выберите номер счета"),
  mfo: z.string().nonempty("MFO обязательно"),

  partnerName: z
    .string()
    .min(3, {
      message: "Имя контрагента должно быть не менее 3 символов.",
    })
    .trim(),
  purposeOfPayment: z.string().max(420, {
    message: "Примечание должно быть не более 420 символов.",
  }),
});

export type FormValues = z.infer<typeof formSchema>;

type Props = {
  className?: string;
};
export const PaymentForm: React.FC<Props> = ({ className }) => {
  const currentEntity = useEntityStore((state) => state.currentEntity);
  const [accountList, setAccountList] = React.useState<
    partner_account_number[] | []
  >([]);

  const defaultValues = {
    entity_id: currentEntity?.id,
    sample: "",
    accountNumber: "",
    date: undefined,
    expectedDate: undefined,
    deadLineDate: undefined,
    accountSum: 0,
    paySum: 0,
    edrpou: "",
    payments: [
      { paySum: 0, expectedDate: undefined, deadLineDate: undefined },
    ],
    selectedAccount: "",
    partner_id: 0,
    partnerName: "",
    purposeOfPayment: "",
    mfo: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultValues, entity_id: currentEntity?.id },
  });

  const { setValue } = form;

  React.useEffect(() => {
    if (currentEntity) {
      setValue("entity_id", currentEntity.id);
    }
  }, [currentEntity]);

  const onSubmit = (data: FormValues) => {
    console.log(`data`, data);
    apiClient.document.CreateDocument(data)
  };

  const handleChange = (partner: PartnersWithAccounts) => {
    setAccountList(partner.partner_account_number);
    setValue('partner_id', partner.id)
    setValue("partnerName", partner.name);
  };

  const accountHandleChange = (account:partner_account_number) =>{
    setValue("mfo", account?.mfo || "");
  }

  return (
    <div className='flex flex-row justify-around'>
        <aside className={cn("space-y-2 rounded-3xl border-gray-200 border-2 mr-[30px] p-4", className)}>
        <div className="w-[30dvw] p-10">список</div>
      </aside>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 w-auto">
          <Alert>
            <AlertDescription className="w-auto">
              Наименование Плательщика: {currentEntity?.name}
            </AlertDescription>
          </Alert>
          <SampleCombobox
            control={form.control}
            name="sample"
            label="Шаблон"
            placeholder="Выберите шаблон ..."
            empty="Шаблоны не найдены =("
          />
          <Container className="justify-start items-start gap-5">
          <FormInput
            control={form.control}
            name="accountNumber"
            label="Номер счета"
              placeholder="Введите номер счета"
              description="Номер указанный в счете"
          />
          <FormDatePicker
            control={form.control}
            name="date"
            label="Дата счета"
            description="Дата указанная в счете"
            />
          </Container>
          <SumAndDateForm
            control={form.control}
          />
          <div className=" w-auto rounded-3xl border-gray-200 border-2 ml-[-20px] p-4">
          <Container className="justify-start gap-5 pb-2">
            <AccountsCombobox
              control={form.control}
              name="selectedAccount"
              label="Номер счета"
              placeholder="Выберите Номер счета..."
              empty="Номера счетов не найдены =("
              data={accountList}
              accountHandleChange={accountHandleChange}
            />
            <PartnersCombobox
              control={form.control}
              name="edrpou"
              label="ЕДРПОУ"
              placeholder="Выберите ЕДРПОУ..."
              empty="ЕДРПОУ не найдены =("
              handleChange={handleChange}
              id={currentEntity?.id}
            />
            <AddPartner className="self-end" />
          </Container>
          <Container className="justify-start gap-5">
          <FormInput
            control={form.control}
            name="partnerName"
            label="Имя контрагента"
          />
          <FormInput
            control={form.control}
            name="mfo"
            label="МФО"
            type="number"
            />
            </Container>
            </div>
          <FormInput
            control={form.control}
            name="purposeOfPayment"
            label="Примечание"
            placeholder="Оплата по счету"
            description="Примечание документа"
          />
          <Button type="submit" >
            Сохранить
          </Button>
          <Button type="submit" className="ml-8">
            Отправить на оплату
          </Button>
        </form>
        </Form>

    </div>
  );
};
