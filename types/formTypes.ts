// types/formTypes.ts
import { z } from "zod";

export const paymentSchema = z.object({
  documents_id: z.number().optional(),
  paySum: z.preprocess((value) => {
    if (typeof value === "string") value = value.replace(/,/g, ".");
    return value === "" ? 0 : Number(value);
  }, z.number().min(0.1, "Сумма должна быть больше 0")),
  isPaid: z.boolean().optional(),
  purposeOfPayment: z.string().max(420, {
    message: "Примечание должно быть не более 420 символов.",
  }),
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
  entity_id: z.number().optional(),
  partner_id: z.number().optional(),
  partner_account_number_id: z.number().optional(),
  sample: z.string().optional(),
  accountNumber: z
    .string()
    .min(2, "Номер счета должен быть не менее 2 символов."),
  vatType: z.boolean().default(true),
  vatPercent: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().optional()
  ),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.union([z.date({ message: "Пожалуйста, выберите дату" }), z.null()])),
  accountSum: z
    .string()
    .regex(/^(=)?[0-9,\-+*/().\s]+$/, "Сумма должна состоять только из цифр"),
  accountSumExpression: z.string().optional(),
  payments: z.array(paymentSchema),
  edrpou: z.string(),
  selectedAccount: z.string().nonempty("Выберите номер счета"),

  mfo: z.string().optional(),
  bank_name: z.string().optional(),

  short_name: z.string(),
  full_name: z.string(),
  purposeOfPayment: z.string().max(420, {
    message: "Примечание должно быть не более 420 символов.",
  }),
  note: z.string().optional(),
  is_auto_payment: z.boolean().optional(),
});

export type PaymentValues = z.infer<typeof paymentSchema>;
export type FormValues = z.infer<typeof formSchema>;
