import { useMemo } from "react";
import { z } from "zod";

/**
 * Валидатор «украинского» IBAN:
 *  - UA + 2 контрольные цифры
 *  - 6-значный МФО
 *  - 19-значный номер счёта
 *  (без пробелов)
 */
const uaIbanSchema = z
  .string()
  .regex(
    /^UA\d{27}$/,
    "Некорректный IBAN для Украины (должно быть 29 символов: UA + 27 цифр)"
  );

type Result = { mfo: string; error: null } | { mfo: ""; error: string };

export function useMfoFromIban(iban?: string): Result {
  return useMemo<Result>(() => {
    if (!iban) {
      return { mfo: "", error: "IBAN не указан" };
    }

    const cleaned = iban.replace(/\s+/g, "").toUpperCase();

    const parsed = uaIbanSchema.safeParse(cleaned);
    if (!parsed.success) {
      return { mfo: "", error: parsed.error.errors[0].message };
    }

    const mfo = cleaned.slice(4, 10);

    return { mfo, error: null };
  }, [iban]);
}
