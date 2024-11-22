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
import { FormDatePicker, FormInput } from "@/components/shared";
import { Combobox } from "@/components/shared/combobox";
import { useEntityStore, useFormStore } from "@/store/store";
import { partner_account_number, partners } from "@prisma/client";
import { Comboboxac } from "@/components/shared/comboboxac";
import { PartnersWithAccounts } from "@/services/partners";

const formSchema = z.object({
  entity_id: z.number(),
  sample: z
    .string()
    .min(2, {
      message: "Не придумал",
    })
    .optional(),
  accountNumber: z
    .string({ message: "Пожалуйста, заполните это поле" })
    .min(2, {
      message: "Номер счета должен быть не менее 2 символов.",
    }),

  date: z.date({ message: "Пожалуйста, выберите дату" }),

  expectedDate: z.date({ message: "Пожалуйста, выберите дату" }),

  deadLineDate: z.date({ message: "Пожалуйста, выберите дату" }),

  accountSum: z.number().nonnegative({
    message: "Сумма должна быть положительной",
  }),
  paySum: z.number().nonnegative({
    message: "Сумма должна быть положительной",
  }),
  edrpou: z.string().length(8, {
    message: "ЕДРПОУ должен быть 8 цифр",
  }),
  bankAccount: z.string().min(1, {
    message: "Введите банковский счёт",
  }),
  partnerName: z
    .string()
    .min(3, {
      message: "Имя контрагента должно быть не менее 3 символов.",
    })
    .trim(),
  mfo: z.string().trim(),
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
  const [accountList, setAccountList] = React.useState<partner_account_number[] | undefined>([]);

  // const formData = useFormStore((state) => state.currentFormData);
  // const updateCurrentFormData = useFormStore(
  //   (state) => state.updateCurrentFormData
  // );

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
    bankAccount: "",
    partnerName: "",
    mfo: "",
    purposeOfPayment: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultValues, entity_id: currentEntity?.id },
  });

  //const [formState, setFormState] = React.useState(defaultValues);

  const { getValues, reset,setValue } = form;

  const onSubmit = (data: FormValues) => {
    console.log(`data ${data}`); // Получите все значения формы при сабмите
  };

  const handleGetValues = () => {
    const accountNumber = getValues("accountNumber");
    const  values  = getValues(); // Получите все значения формы
    console.log(`values ${JSON.stringify(values, null, 2)}`);
  };

  const handleChange = (partner: PartnersWithAccounts) => {
    //setValue("edrpou", partner.edrpou);
    setAccountList(partner.partner_account_number);
    setValue("mfo", partner.mfo);
    setValue("partnerName", partner.name);

  };

  // const handleChangeDate = (name: string, date: Date | undefined) => {
  //   setFormState((prev) => ({ ...prev, [name]: date }));
  //   //updateCurrentFormData({ [name]: date });
  // };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Alert>
            <AlertDescription>
              Наименование Плательщика: {currentEntity?.name}
            </AlertDescription>
          </Alert>
          <FormInput
            control={form.control}
            name="sample"
            label="Шаблон"
            placeholder="Выберите шаблон ..."
          />
          <FormInput
            control={form.control}
            name="accountNumber"
            label="Номер счета"
            placeholder="Введите номер счета"
          />
          <Container className="justify-start gap-10">
            <FormDatePicker
              control={form.control}
              name="date"
              label="Дата"
              description="Дата указанная в счете"
            />
            <FormDatePicker
              control={form.control}
              name="expectedDate"
              label="Дата"
              description="Желательно заплатить до"
            />
            <FormDatePicker
              control={form.control}
              name="deadLineDate"
              label="Дата"
              description="Крайний срок оплаты счета"
            />
          </Container>
          <Container className="justify-start gap-10">
            <FormInput
              control={form.control}
              type="number"
              name="accountSum"
              label="Сумма"
              description="Сумма указанная в счете"
            />
            <FormInput
              control={form.control}
              type="number"
              name="paySum"
              label="Сумма к оплате"
              description="Фактическая сумма оплаты, если 0, то сумма будет равна сумме счета"
            />
          </Container>
          <Container className="justify-start gap-10">
            {/* <FormInput
              control={form.control}
              name="bankAccount"
              label="Номер счета"
            /> */}
            <Comboboxac
              control={form.control}
              name="bankAccount"
              label="Номер счета"
              placeholder="Выберите Номер счета..."
              emty="Номера счетов не найдены =("
              //onChange={handleChange}
              data={accountList}
            />
            <Combobox
              control={form.control}
              name="edrpou"
              label="ЕДРПОУ"
              placeholder="Выберите ЕДРПОУ..."
              emty="ЕДРПОУ не найдены =("
              onChange={handleChange}
              id={currentEntity?.id}
            />
          </Container>
          <FormInput
            control={form.control}
            name="partnerName"
            label="Имя контрагента"
          />
          <FormInput control={form.control} name="mfo" label="МФО" />
          <FormInput
            control={form.control}
            name="purposeOfPayment"
            label="Примечание"
            placeholder="Оплата по счету"
            description="Оплата по счету"
          />
          <Button type="submit" onClick={handleGetValues}>
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
