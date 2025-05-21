// lib/zodSchemas.ts
import { z } from "zod";

export const entitySchema = z.object({
  short_name: z.string().min(2, "Короткое имя должно содержать минимум 2 символа"),
  full_name: z.string().min(2, "Полное имя должно содержать минимум 2 символа"),
  edrpou: z.string().min(8,"ЕДРПОУ должен состоять из 8 или 10 символов").max(10, "ЕДРПОУ должен состоять из 8 или 10 символов"),
  bank_account: z.string().length(29, "Счет должен состоять из 29 символов"),
  bank_name: z.string().nullable().optional(),
  mfo: z.string().nullable().optional(),
  is_deleted: z.boolean().optional()
});

export const partnerSchema = z.object({
  shortName: z.string().min(2, "Короткое название должно содержать минимум 2 символа"),
  fullName: z.string().min(2, "Полное название должно содержать минимум 2 символа"),
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
