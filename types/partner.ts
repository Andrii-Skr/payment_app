import { z } from "zod";
import { optionalBankAccountSchema } from "@/lib/validators/bankAccount";

export const partnerFormSchema = z.object({
  entity_id: z.number(),
  full_name: z.string().min(3),
  short_name: z.string().min(3),
  edrpou: z.string().min(8).max(10).regex(/^\d+$/, "ЕДРПОУ должен содержать только цифры"),
  bank_account: optionalBankAccountSchema,
  mfo: z.string().optional(),
  bank_name: z.string().optional(),
});

export type PartnerValues = z.infer<typeof partnerFormSchema>;
