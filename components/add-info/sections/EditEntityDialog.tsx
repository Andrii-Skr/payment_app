"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, Form } from "@/components/ui";
import { Row } from "@/types/infoTypes";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Container, FormInput } from "@/components/shared";

const schema = z.object({
  full_name: z.string().min(1, "Обязательное поле"),
  short_name: z.string().min(1, "Обязательное поле"),
  edrpou: z.string().min(8).max(10),
  bank_account: z.string().length(29),
  sort_order: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Введите число",
    })
    .optional(),
});

type EditEntityValues = z.infer<typeof schema>;

type Props = {
  row: Row | null;
  onClose: () => void;
  onSave: (v: EditEntityValues & { id: number }) => Promise<void>;
};

export function EditEntityDialog({ row, onClose, onSave }: Props) {
  const form = useForm<EditEntityValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      short_name: "",
      full_name: "",
      edrpou: "",
      bank_account: "",
      sort_order: 0,
    },
  });

  /* заполняем при открытии, очищаем при закрытии */
  useEffect(() => {
    if (row) {
      form.reset({
        short_name: row.short_name,
        full_name: row.full_name,
        edrpou: row.edrpou,
        bank_account: row.bank_account,
        sort_order: row.sort_order ?? 0,
      });
    } else {
      form.reset(); // возвращаем defaultValues
    }
  }, [row, form]);

  async function submit(values: EditEntityValues) {
    if (!row) return;
    try {
      await onSave({ ...values, id: row.id });

      onClose();
    } catch (err: any) {}
  }

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Редактировать контрагента</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <Container className="gap-2 justify-start">
              <FormInput
                control={form.control}
                name="full_name"
                label="Название"
                className="bank-account-size"
              />
              <FormInput
                control={form.control}
                name="short_name"
                label="Название"
              />
              <FormInput control={form.control} name="edrpou" label="ЕДРПОУ" />
            </Container>
            <Container className="gap-2 justify-start">
              <FormInput
                control={form.control}
                name="bank_account"
                className="bank-account-size"
                label="р/с"
              />
              <FormInput
                control={form.control}
                name="sort_order"
                label="Сортировка"
                type="number"
              />
            </Container>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
