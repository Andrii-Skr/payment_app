"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Container, FormInput } from "@/components/shared";
import { Button, Checkbox, Form, LoadingMessage } from "@/components/ui";
import { toast } from "@/lib/hooks/use-toast";
import { useAutoFillBankDetails } from "@/lib/hooks/useAutoFillBankDetails";
import { apiClient } from "@/services/api-client";
import { entitySchema, type InfoFormValues, type Row } from "@/types/infoTypes";
import { EntityTable } from "./entityTable";

export function EntitySection() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const showDeletedId = useId();

  const form = useForm<InfoFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      short_name: "",
      full_name: "",
      edrpou: "",
      bank_account: "",
      bank_name: "",
      mfo: "",
      sort_order: 0,
    },
  });

  /* ───────── автозаполнение МФО/банка ───────── */
  const bankAccountValue = form.watch("bank_account");
  const { mfo, bankName } = useAutoFillBankDetails(bankAccountValue);

  useEffect(() => {
    if (mfo) form.setValue("mfo", mfo);
    if (bankName) form.setValue("bank_name", bankName);
  }, [mfo, bankName, form]);

  /* ───────── загрузка / обновление данных ───────── */
  const loadEntities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.entities.getAll(true);

      data.sort((a: Row, b: Row) => Number(a.is_deleted) - Number(b.is_deleted));

      setRows(data);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  /* ───────── CRUD операции ───────── */
  const handleCreate = async (data: InfoFormValues) => {
    try {
      await apiClient.entities.create(data);
      toast.success("Успешно создан.");
      form.reset();
      await loadEntities();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(err);
      toast.error(message);
    }
  };

  const handleUpdate = async (data: Partial<Row>) => {
    try {
      await apiClient.entities.update(data);
      await loadEntities();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleRemove = async (id: number, data: boolean) => {
    try {
      await apiClient.entities.remove(id, data);
      await loadEntities();
    } catch (err) {
      console.log(err);
      setError(String(err));
    }
  };

  /* ───────── фильтрация для таблицы ───────── */
  const filteredRows = useMemo(() => (showDeleted ? rows : rows.filter((r) => !r.is_deleted)), [rows, showDeleted]);

  /* ───────── JSX ───────── */
  return (
    <Container className="flex-col items-start gap-5 w-full min-w-[995px]">
      {/* ───── форма создания контрагента ───── */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCreate, (errors) => console.warn("Zod validation errors:", errors))}
          className="space-y-4"
        >
          <Container className="justify-start gap-2">
            <FormInput
              control={form.control}
              name="full_name"
              label="Полное имя"
              placeholder='ТОВ "Ромашка"'
              className="bank-account-size"
            />
            <FormInput control={form.control} name="short_name" label="Короткое имя" placeholder="Ромашка" />
            <FormInput
              control={form.control}
              name="edrpou"
              label="ЕДРПОУ"
              placeholder="12345678"
              className="min-w-[105px]"
            />
          </Container>
          <Container className="justify-start gap-2">
            <FormInput
              control={form.control}
              name="bank_account"
              className="bank-account-size"
              label="р/с"
              placeholder="UA12345678..."
            />
          </Container>
          <div className="flex gap-3">
            <Button type="submit" className="w-[145px] " disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Сохраняю…" : "Создать"}
            </Button>
          </div>
        </form>
      </Form>

      {/* ───── чекбокс «Показать удалённые» ───── */}
      <label className="flex items-center gap-2 select-none text-sm" htmlFor={showDeletedId}>
        <Checkbox
          id={showDeletedId}
          checked={showDeleted}
          onCheckedChange={(v) => setShowDeleted(Boolean(v))}
          className="h-4 w-4"
        />
        Показать удалённые
      </label>

      {/* ───── контент (таблица / лоадер / ошибка) ───── */}
      {loading ? (
        <LoadingMessage />
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <EntityTable rows={filteredRows} onRemove={handleRemove} onUpdate={handleUpdate} />
      )}
    </Container>
  );
}
