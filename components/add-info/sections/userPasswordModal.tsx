"use client";

import type { UserWithRelations } from "@api/users/route";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput } from "@/components/shared";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Form } from "@/components/ui";
import { toast } from "@/lib/hooks/use-toast";
import { apiClient } from "@/services/api-client";

interface Props {
  user: UserWithRelations;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => Promise<void>;
}

const schema = z.object({
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

export function UserPasswordModal({ user, open, onOpenChange, onSaved }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const onSubmit = async (vals: FormData) => {
    try {
      await apiClient.users.changePassword(user.id, vals.password);
      toast.success("Пароль обновлён");
      await onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Не удалось обновить пароль");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Изменить пароль</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormInput control={form.control} name="password" label="Новый пароль" type="password" />
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
