// types/formTypes.ts
import { z } from "zod";

export const paymentSchema = z.object({
  documents_id: z.number().optional(),
  paySum: z.preprocess((value) => {
    if (typeof value === "string") value = value.replace(/,/g, ".");
    return value === "" ? 0 : Number(value);
  }, z.number().min(0.1, "Сумма должна быть больше 0")),
  isPaid: z.boolean().optional(),
  paidDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.union([z.date(), z.null()]).optional()),
  expectedDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.union([z.date(), z.null()]).optional()),
  deadLineDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.union([z.date(), z.null()]).optional()),
});

export const formSchema = z.object({
  doc_id: z.number().optional(),
  entity_id: z.number(),
  partner_id: z.number(),
  sample: z.string().optional(),
  accountNumber: z
    .string()
    .min(2, "Номер счета должен быть не менее 2 символов."),
  vatType: z.boolean().default(true),
  vatPercent: z.number().optional(),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
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
