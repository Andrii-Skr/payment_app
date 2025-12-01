"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container, PartnerInput } from "@/components/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Form, Label, Separator, Switch } from "@/components/ui";
import { formatBankAccount } from "@/lib/helpers/formatiban";
import { toast } from "@/lib/hooks/use-toast";
import { apiClient } from "@/services/api-client";
import type { AccountItem } from "@/store/accountListStore";
import { useAccountListStore } from "@/store/accountListStore";
import { usePartnersStore } from "@/store/partnersStore";

type Props = {
  show: boolean;
  hideDelete?: boolean;
  entityId: number;
  partnerId?: number;
  onDefaultChange?: (acc: { bank_account: string; id: number }) => void;
};

export const PartnerAccountsList: React.FC<Props> = ({ show, hideDelete, entityId, partnerId, onDefaultChange }) => {
  const { currentAccountList, updateAccountList } = useAccountListStore();
  const { fetchPartners } = usePartnersStore();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [addMode, setAddMode] = useState(false);

  const bankSchema = z.object({
    bank_account: z.string().length(29, "29 символов"),
    mfo: z.string().optional(),
    bank_name: z.string().optional(),
  });

  type BankForm = z.infer<typeof bankSchema>;

  const bankForm = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    defaultValues: { bank_account: "" },
  });

  if (!show) return null;

  const visibleAccounts = currentAccountList.filter((acc) => !acc.is_deleted);

  if (visibleAccounts.length === 0) return null;

  const handleSetDefault = async (id: number, checked: boolean) => {
    setLoadingId(id);
    const prevList = currentAccountList;
    const optimistic = currentAccountList.map((acc) => ({
      ...acc,
      is_default: checked ? acc.id === id : false,
    }));
    updateAccountList(optimistic);

    try {
      await apiClient.partners.setDefaultAccount(id, entityId, checked);

      await fetchPartners(entityId);

      const newDefault = optimistic.find((a) => a.is_default);
      if (newDefault && onDefaultChange && checked) {
        onDefaultChange({
          bank_account: newDefault.bank_account,
          id: newDefault.id,
        });
      }

      toast.success(checked ? "Счёт назначен основным" : "Счёт больше не основной");
    } catch {
      updateAccountList(prevList);
      toast.error("Ошибка при назначении счёта");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingId(id);
    try {
      await apiClient.partners.deleteAccount(id, true, entityId);
      updateAccountList(currentAccountList.map((acc) => (acc.id === id ? { ...acc, is_deleted: true } : acc)));
      toast.success("Счёт удалён");
    } catch {
      toast.error("Ошибка при удалении счёта");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddBank = async (vals: BankForm) => {
    if (!partnerId) return;
    setLoadingId(-1);
    try {
      const result = await apiClient.partners.addBankAccount({
        partner_id: partnerId,
        entity_id: entityId,
        ...vals,
      });

      if (result.message) {
        toast.error(result.message);
      } else {
        const created = result.created;
        const rel = "entities" in created ? (created.entities as any)[0] : undefined;
        const accItem: AccountItem = {
          ...created,
          is_default: rel?.is_default ?? created.is_default ?? false,
          is_visible: rel?.is_visible ?? created.is_visible ?? true,
          is_deleted: rel?.is_deleted ?? created.is_deleted ?? false,
        };
        updateAccountList([...currentAccountList, accItem]);
        await fetchPartners(entityId);
        toast.success("Счёт добавлен");
        bankForm.reset();
        setAddMode(false);
      }
    } catch {
      toast.error("Не удалось добавить счёт");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Счета контрагента</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleAccounts.map((acc, idx) => (
          <div key={acc.id}>
            {idx > 0 && <Separator />}
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm">{formatBankAccount(acc.bank_account)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={acc.is_default}
                    onCheckedChange={(checked) => handleSetDefault(acc.id, checked)}
                    disabled={loadingId === acc.id}
                    id={`default-${acc.id}`}
                  />
                  <Label htmlFor={`default-${acc.id}`}>Основной</Label>
                </div>

                {!hideDelete && (
                  <Button
                    variant="ghost"
                    className="text-red-500"
                    size="icon"
                    onClick={() => handleDelete(acc.id)}
                    disabled={loadingId === acc.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {partnerId &&
          (!addMode ? (
            <Button variant="ghost" onClick={() => setAddMode(true)} className="mt-4">
              + Добавить счёт
            </Button>
          ) : (
            <Form {...bankForm}>
              <form
                onSubmit={(e) => {
                  e.stopPropagation();
                  bankForm.handleSubmit(handleAddBank)(e);
                }}
                className="space-y-2 mt-4"
              >
                <Container className="justify-start gap-2">
                  <PartnerInput<BankForm>
                    control={bankForm.control}
                    name="bank_account"
                    label="Счёт"
                    className="bank-account-size"
                  />
                </Container>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loadingId === -1}>
                    Сохранить
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      bankForm.reset();
                      setAddMode(false);
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </Form>
          ))}
      </CardContent>
    </Card>
  );
};
