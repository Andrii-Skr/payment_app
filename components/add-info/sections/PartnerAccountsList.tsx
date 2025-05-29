"use client";

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
import { Trash2 } from "lucide-react";
import { partner_account_number } from "@prisma/client";
import { formatBankAccount } from "@/lib/helpers/formatiban";
import { toast } from "@/lib/hooks/use-toast";

type Props = {
  accounts: partner_account_number[];
  onSetDefault: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  loadingId: number | null;
  showDeleted: boolean;
  showHidden: boolean;
};

export const PartnerAccountsList: React.FC<Props> = ({
  accounts,
  onSetDefault,
  onDelete,
  loadingId,
  showDeleted,
  showHidden,
}) => {
  // 🔍 Фильтрация по is_deleted и is_visible
  const visibleAccounts = accounts.filter(
    (a) => (showDeleted || !a.is_deleted) && (showHidden || a.is_visible !== false)
  );

  if (!visibleAccounts.length) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Счета контрагента
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleAccounts.map((acc, idx) => (
          <div key={acc.id}>
            {idx > 0 && <Separator />}
            <div className="flex justify-between items-center py-2">
              <p className="text-sm">{formatBankAccount(acc.bank_account)}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={acc.is_default}
                    onCheckedChange={async () => {
                      try {
                        await onSetDefault(acc.id);
                      } catch {
                        toast.error("Не удалось назначить счёт основным");
                      }
                    }}
                    disabled={loadingId === acc.id || acc.is_deleted}
                    id={`default-${acc.id}`}
                  />
                  <Label htmlFor={`default-${acc.id}`}>Основной</Label>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className={acc.is_deleted ? "bg-green-500" : "bg-red-500"}
                  title={acc.is_deleted ? "Восстановить" : "Удалить"}
                  onClick={() => onDelete(acc.id)} // 👈 логика restore/delete на стороне родителя
                  disabled={loadingId === acc.id}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
