// lib/zodSchemas.ts
import { optional, z } from "zod";

export const entitySchema = z.object({
  name: z.string().min(2),
  edrpou: z.string().min(8,"ЕДРПОУ должен состоять из 8 или 10 символов").max(10, "ЕДРПОУ должен состоять из 8 или 10 символов"),
  bank_account: z.string().min(29, "Счет должен состоять из 29 символов"),
  bank_name: z.string().nullable().optional(),
  mfo: z.string().nullable().optional(),
  is_deleted: z.boolean().optional()
});

export const partnerSchema = z.object({
  name: z.string().min(2),
  edrpou: z.string().length(8),
  type: z.number().optional(), // 0 | 1, уточните позже
});

export const userSchema = z.object({
  login: z.string().min(2),
  password: z.string().min(6),
  name: z.string().min(2),
});

export type InfoFormValues = z.infer<typeof entitySchema>;
export type Row = InfoFormValues & { id: number };
