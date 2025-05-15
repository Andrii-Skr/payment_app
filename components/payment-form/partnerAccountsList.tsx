"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAccountListStore } from "@/store/store";
import { setDefaultAccount, deleteAccount } from "@/services/partners";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Separator,
  Switch,
} from "@/components/ui/";
import { toast } from "@/lib/hooks/use-toast";
import { formatBankAccount } from "@/lib/helpers/formatiban";

export const PartnerAccountsList: React.FC = () => {
  const { currentAccountList, updateAccountList } = useAccountListStore();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleSetDefault = async (id: number) => {
    setLoadingId(id);
    try {
      await setDefaultAccount(id);
      const updated = currentAccountList.map((acc) => ({
        ...acc,
        is_default: acc.id === id,
      }));
      updateAccountList(updated);
      toast.success("Счёт назначен основным.");
    } catch {
      toast.error("Ошибка при обновлении основного счёта.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingId(id);
    try {
      await deleteAccount(id);
      updateAccountList(
        currentAccountList.map((acc) =>
          acc.id === id ? { ...acc, is_deleted: true } : acc
        )
      );
      toast.success("Счёт удалён.");
    } catch {
      toast.error("Ошибка при удалении счёта.");
    } finally {
      setLoadingId(null);
    }
  };

  const visibleAccounts = currentAccountList.filter((acc) => !acc.is_deleted);

  if (visibleAccounts.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Счета контрагента
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        {visibleAccounts.map((acc, idx) => (
          <div key={acc.id}>
            {idx > 0 && <Separator />}
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm ">
                  {formatBankAccount(acc.bank_account)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={acc.is_default}
                    onCheckedChange={() => handleSetDefault(acc.id)}
                    disabled={loadingId === acc.id}
                    id={`default-${acc.id}`}
                  />
                  <Label htmlFor={`default-${acc.id}`}>Основной</Label>
                </div>
                <Button
                  variant="ghost"
                  className="text-red-500"
                  size="icon"
                  onClick={() => handleDelete(acc.id)}
                  disabled={loadingId === acc.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
