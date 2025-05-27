import { z } from "zod";

// ────────── вспомогательный валидатор строки вида YYYY-MM-DD ──────────
const dateOnlyString = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Дата должна быть в формате YYYY-MM-DD"
  );

// ────────── общий «коэрсер»: string | Date  →  Date ──────────
const dateCoerce = z.preprocess(
  (arg) => {
    if (arg instanceof Date) return arg;
    if (typeof arg === "string" && /^\d{4}-\d{2}-\d{2}$/.test(arg)) {
      return new Date(arg + "T00:00:00");
    }
    return arg;                                 // пусть Zod проверит дальше
  },
  z.date({ required_error: "Пожалуйста, выберите дату" })
).nullish();

// ────────── Схема платежа ──────────
export const paymentSchema = z.object({
  documents_id: z.number().optional(),
  paySum: z.preprocess(
    (v) => (typeof v === "string" ? Number(v.replace(/,/g, ".")) : v),
    z.number().min(0.1, "Сумма должна быть больше 0")
  ),
  isPaid: z.boolean().optional(),
  purposeOfPayment: z.string().max(420),
  paidDate: dateCoerce.nullish(),       // Date | string | null
  expectedDate: dateCoerce.nullish(),
  deadLineDate: dateCoerce.nullish(),
});

// ────────── Основная форма ──────────
export const formSchema = z.object({
  doc_id: z.number().optional(),
  entity_id: z.number().optional(),
  partner_id: z.number().optional(),
  partner_account_number_id: z.number().optional(),
  sample: z.string().optional(),

  accountNumber: z.string().min(2, "Номер счета должен быть не менее 2 символов."),
  vatType: z.boolean().default(true),
  vatPercent: z.preprocess(
    (v) => (v !== undefined ? Number(v) : v),
    z.number().optional()
  ),

  // главное поле даты счёта: Date | 'YYYY-MM-DD'
  date: dateCoerce,

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
  purposeOfPayment: z.string().max(420),
  note: z.string().optional(),

  is_auto_payment: z.boolean().optional(),
});

export type PaymentValues = z.infer<typeof paymentSchema>;
export type FormValues   = z.infer<typeof formSchema>;
