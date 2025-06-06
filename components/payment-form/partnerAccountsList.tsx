"use client";

import React, { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Separator,
  Switch,
} from "@/components/ui";
import { formatBankAccount } from "@/lib/helpers/formatiban";
import { useAccountListStore } from "@/store/store";
import { apiClient } from "@/services/api-client";
import { toast } from "@/lib/hooks/use-toast";

type Props = {
  show: boolean;
  hideDelete?: boolean;
  onDefaultChange?: (acc: { bank_account: string; id: number }) => void;
};

export const PartnerAccountsList: React.FC<Props> = ({ show, hideDelete, onDefaultChange }) => {
  const { currentAccountList, updateAccountList } = useAccountListStore();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  if (!show) return null;

  const visibleAccounts = useMemo(
    () => currentAccountList.filter((acc) => !acc.is_deleted),
    [currentAccountList]
  );

  if (visibleAccounts.length === 0) return null;

  const handleSetDefault = async (id: number) => {
    setLoadingId(id);
    try {
      await apiClient.partners.setDefaultAccount(id);

      const updated = currentAccountList.map((acc) => ({
        ...acc,
        is_default: acc.id === id,
      }));
      updateAccountList(updated);

      const newDefault = updated.find((a) => a.id === id);
      if (newDefault && onDefaultChange) {
        onDefaultChange({
          bank_account: newDefault.bank_account,
          id: newDefault.id,
        });
      }

      toast.success("Счёт назначен основным");
    } catch {
      toast.error("Ошибка при назначении счёта");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setLoadingId(id);
    try {
      await apiClient.partners.deleteAccount(id, true);
      updateAccountList(
        currentAccountList.map((acc) =>
          acc.id === id ? { ...acc, is_deleted: true } : acc
        )
      );
      toast.success("Счёт удалён");
    } catch {
      toast.error("Ошибка при удалении счёта");
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
                    onCheckedChange={() => handleSetDefault(acc.id)}
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
      </CardContent>
    </Card>
  );
};
