import { z } from "zod";

const REQUIRED_MESSAGE = "Счёт обязателен";
const LENGTH_MESSAGE = "Счёт должен состоять из 29 символов";
const FORMAT_MESSAGE = "Счёт должен начинаться с буквенного кода и содержать только буквы и цифры";

const normalizedBankAccount = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/\s+/g, "").trim().toUpperCase() : value),
  z
    .string({ required_error: REQUIRED_MESSAGE })
    .min(1, REQUIRED_MESSAGE)
    .length(29, LENGTH_MESSAGE)
    .regex(/^[A-Z]{2}[A-Z0-9]{27}$/, FORMAT_MESSAGE),
);

export const bankAccountSchema = normalizedBankAccount;

export const optionalBankAccountSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const normalized = value.replace(/\s+/g, "").trim().toUpperCase();
    return normalized === "" ? undefined : normalized;
  },
  z
    .string()
    .length(29, LENGTH_MESSAGE)
    .regex(/^[A-Z]{2}[A-Z0-9]{27}$/, FORMAT_MESSAGE)
    .optional(),
);
