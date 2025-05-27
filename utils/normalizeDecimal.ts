// utils/normalizeDecimal.ts
import type { Decimal } from "@prisma/client/runtime/library";

export type ReplaceDecimal<T> = {
  [K in keyof T]: T[K] extends Decimal ? number : T[K];
};

/* быстрая проверка, не тянет runtime-класс */
function isPrismaDecimal(val: unknown): val is Decimal {
  return typeof val === "object" && val !== null && "toNumber" in val;
}

export function normalizeDecimalFields<T extends Record<string, unknown>>(
  obj: T
): ReplaceDecimal<T> {
  const out: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(obj)) {
    out[k] = isPrismaDecimal(v) ? Number(v) : v;
  }

  return out as ReplaceDecimal<T>;
}

export const normalizeArray = <T extends Record<string, unknown>>(
  arr: T[]
): ReplaceDecimal<T>[] => arr.map(normalizeDecimalFields);
