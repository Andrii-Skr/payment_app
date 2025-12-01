"use client";

import type { UserWithRelations } from "@api/users/route";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { toast } from "@/lib/hooks/use-toast";
import { apiClient } from "@/services/api-client";

interface Props {
  user: UserWithRelations;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => Promise<void>;
}

type Role = { id: number; name: string };

const schema = z.object({
  login: z.string().min(1, "Обязательное поле"),
  name: z.string().min(1, "Обязательное поле"),
  role_id: z.number(),
});

type FormData = z.infer<typeof schema>;

export function UserEditModal({ user, open, onOpenChange, onSaved }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      login: user.login,
      name: user.name,
      role_id: user.role.id,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ login: user.login, name: user.name, role_id: user.role.id });
      (async () => {
        const data = await apiClient.users.getRoles();
        setRoles(data);
      })();
    }
  }, [open, user, form]);

  const onSubmit = async (vals: FormData) => {
    try {
      await apiClient.users.updateUser(user.id, vals);
      toast.success("Изменения сохранены");
      await onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Не удалось сохранить изменения");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormInput control={form.control} name="login" label="Логин" />
            <FormInput control={form.control} name="name" label="Имя" />

            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Роль</FormLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
