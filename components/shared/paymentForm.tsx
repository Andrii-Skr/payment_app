"use client";

import { Button, Form, FormLabel } from "@/components/ui";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container } from "@/components/shared/container";
import { FormDatePicker, FormInput } from "@/components/shared";
import { Combobox } from "@/components/shared/combobox";

const formSchema = z.object({
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
  date: z.date({
    message: "Пожалуйста, выберите дату",
  }),
  expectedDate: z.date({
    message: "Пожалуйста, выберите дату",
  }),
  deadLineDate: z.date({
    message: "Пожалуйста, выберите дату",
  }),
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

function onSubmit(values: z.infer<typeof formSchema>) {
  // Do something with the form values.
  // ✅ This will be type-safe and validated.
  console.log(values);
}

export type FormValues = z.infer<typeof formSchema>;

type Props = {
  className?: string;
};
export const PaymentForm: React.FC<Props> = ({ className }) => {

  const defaultValues = {
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
    defaultValues,
  });

  const [formState, setFormState] = React.useState(defaultValues);

  console.log(formState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            value={formState.accountNumber}
            onChange={handleChange}
          />
          <Container className="justify-start gap-10">
            <FormDatePicker
              control={form.control}
              name="date"
              label="Дата"
              description="Дата указанная в счете"
              value={formState.date}
              onChange={handleChange}
            />
            <FormDatePicker
              control={form.control}
              name="expectedDate"
              label="Дата"
              description="Желательно заплатить до"
              value={formState.expectedDate}
              onChange={handleChange}
            />
            <FormDatePicker
              control={form.control}
              name="deadLineDate"
              label="Дата"
              description="Крайний срок оплаты счета"
              value={formState.deadLineDate}
              onChange={handleChange}
            />
          </Container>
          <Container className="justify-start gap-10">
            <FormInput
              control={form.control}
              name="accountSum"
              label="Сумма"
              description="Сумма указанная в счете"
            />
            <FormInput
              control={form.control}
              name="paySum"
              label="Сумма к оплате"
              description="Фактическая сумма оплаты, если 0, то сумма будет равна сумме счета"
            />
          </Container>
          <Container className="justify-start gap-10">
            <FormInput
              control={form.control}
              name="bankAccount"
              label="Номер счета"
            />
            <Combobox />
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
          <Button type="submit">Сохранить</Button>
          <Button type="submit" className="ml-8">
            Отправить на оплату
          </Button>
        </form>
      </Form>
    </div>
  );
};
