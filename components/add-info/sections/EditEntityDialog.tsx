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
  name: z.string().min(1, "Обязательное поле"),
  edrpou: z.string().min(8).max(10),
  bank_account: z.string().min(1),
});

type EditEntityValues = z.infer<typeof schema>;

type Props = {
  row: Row | null;
  onClose: () => void;
  onSave: (v: EditEntityValues & { id: number }) => Promise<void>;
};

export default function EditEntityDialog({ row, onClose, onSave }: Props) {
  const form = useForm<EditEntityValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", edrpou: "", bank_account: "" },
  });

  /* заполняем при открытии, очищаем при закрытии */
  useEffect(() => {
    if (row) {
      form.reset({
        name: row.name,
        edrpou: row.edrpou,
        bank_account: row.bank_account,
      });
    } else {
      form.reset(); // возвращаем defaultValues
    }
  }, [row, form]);

  async function submit(values: EditEntityValues) {
    if (!row) return;
    await onSave({ ...values, id: row.id });
    onClose();
  }

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Редактировать контрагента</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <Container className="gap-2">
              <FormInput control={form.control} name="name" label="Название" />
              <FormInput control={form.control} name="edrpou" label="ЕДРПОУ" />
              <FormInput
                control={form.control}
                name="bank_account"
                className="w-[260px]"
                label="р/с"
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
