// lib/zodSchemas.ts
import { z } from "zod";

export const entitySchema = z.object({
  name: z.string().min(2),
  edrpou: z.string().length(8),
  bank_account: z.string().min(5),
  bank_name: z.string().nullable(),
  mfo: z.string().min(3).nullable(),
  is_deleted: z.boolean(),
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
