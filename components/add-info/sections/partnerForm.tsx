// components/partners/partnerForm.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Form } from "@/components/ui";
import { toast } from "@/lib/hooks/use-toast";
import { Container, PartnerInput } from "@/components/shared";
import { apiClient } from "@/services/api-client";

/* ---------- schema & types ---------- */

const schema = z.object({
  entity_id: z.number(),
  full_name: z.string().min(3, "Мин. 3 символа"),
  short_name: z.string().min(3, "Мин. 3 символа"),
  edrpou: z.string().min(8).max(10),
  bank_account: z.string().length(29, "Должно быть 29 символов"),
  mfo: z.string().optional(),
  bank_name: z.string().optional(),
});

export type PartnerFormValues = z.infer<typeof schema>;

interface Props {
  mode: "create" | "edit";
  entityId: number;
  initialValues?: Partial<PartnerFormValues & { id: number }>;
  onSaved: () => void;
  onCancel?: () => void;
}

/* ---------- component ---------- */

export const PartnerForm: React.FC<Props> = ({
  mode,
  entityId,
  initialValues,
  onSaved,
  onCancel,
}) => {
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      entity_id: entityId,
      full_name: "",
      short_name: "",
      edrpou: "",
      bank_account: "",
      mfo: "",
      bank_name: "",
    },
  });

  /* подставляем initialValues при edit */
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      (
        Object.entries(initialValues) as [keyof PartnerFormValues, any][]
      ).forEach(([k, v]) => form.setValue(k, v));
    }
  }, [initialValues, mode]);

  /* ---------- submit ---------- */

  const onSubmit = async (vals: PartnerFormValues) => {
    try {
      if (mode === "create") {
        /* 1. создаём контрагента */
        const partner = await apiClient.partners.createPartner(vals);

        /* 2. сразу добавляем счёт */
        await apiClient.partners.addBankAccount({
          partner_id: partner.id,
          bank_account: vals.bank_account,
          mfo: vals.mfo,
          bank_name: vals.bank_name,
          is_default: true,
        });
      } else {
        /* редактируем имена партнёра */
        await apiClient.partners.updatePartner(initialValues!.id!, {
          full_name: vals.full_name,
          short_name: vals.short_name,
        });
      }

      toast.success("Сохранено");
      onSaved();
      form.reset();
    } catch {
      toast.error("Ошибка сохранения");
    }
  };

  /* ---------- UI ---------- */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Container className="justify-start gap-2">
          <PartnerInput<PartnerFormValues>
            control={form.control}
            name="full_name"
            label="Полное имя"
            className="bank-account-size"
          />
          <PartnerInput<PartnerFormValues>
            control={form.control}
            name="short_name"
            label="Короткое имя"
          />
          <PartnerInput<PartnerFormValues>
            control={form.control}
            name="edrpou"
            label="ЕДРПОУ"
            readOnly={mode === "edit"}
          />
        </Container>

        <Container className="justify-start gap-2">
          <PartnerInput<PartnerFormValues>
            control={form.control}
            name="bank_account"
            label="р/с"
            className="bank-account-size"
          />
          {/* При необходимости раскомментируйте следующие поля */}
          {/* <PartnerInput<PartnerFormValues> control={form.control} name="mfo" label="МФО" />
          <PartnerInput<PartnerFormValues> control={form.control} name="bank_name" label="Банк" /> */}
        </Container>

        <div className="flex gap-3">
          <Button type="submit" className="w-[145px]">
            {mode === "edit" ? "Сохранить" : "Создать"}
          </Button>

          {mode === "edit" && onCancel && (
            <Button
              type="button"
              variant="ghost"
              className="w-[145px]"
              onClick={onCancel}
            >
              Отмена
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
