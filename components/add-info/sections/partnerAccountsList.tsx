"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container, PartnerInput } from "@/components/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Form, Label, Separator, Switch } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBankAccount } from "@/lib/helpers/formatiban";
import { toast } from "@/lib/hooks/use-toast";
import { bankAccountSchema } from "@/lib/validators/bankAccount";
import { apiClient } from "@/services/api-client";
import type { UpdateAccountError } from "@/services/partners";
import type { AccountItem } from "@/store/accountListStore";

type Props = {
  accounts: AccountItem[];
  onSetDefault: (id: number, checked: boolean) => Promise<void>;
  onDelete: (id: number, entityId: number) => Promise<void>;
  onUpdateAccount: (id: number, bankAccount: string) => void;
  loadingId: number | null;
  showDeleted: boolean;
  showHidden: boolean;
  entityId: number;
};

const editSchema = z.object({
  bank_account: bankAccountSchema,
});

type EditForm = z.infer<typeof editSchema>;

export const PartnerAccountsList: React.FC<Props> = ({
  accounts,
  onSetDefault,
  onDelete,
  onUpdateAccount,
  loadingId,
  showDeleted,
  showHidden,
  entityId,
}) => {
  const t = useTranslations("adminPartners");
  const [editTarget, setEditTarget] = useState<AccountItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { bank_account: "" },
  });

  useEffect(() => {
    if (!editTarget) return;
    editForm.reset({ bank_account: editTarget.bank_account });
  }, [editForm, editTarget]);

  const visibleAccounts = accounts.filter(
    (a) => (showDeleted || !a.is_deleted) && (showHidden || a.is_visible !== false),
  );

  if (!visibleAccounts.length) return null;

  const handleEditAccount = async (vals: EditForm) => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      await apiClient.partners.updateAccount({
        partner_account_number_id: editTarget.id,
        entity_id: entityId,
        bank_account: vals.bank_account,
      });
      onUpdateAccount(editTarget.id, vals.bank_account);
      toast.success(t("accountUpdated"));
      setEditTarget(null);
    } catch (error) {
      const message =
        (error as UpdateAccountError | undefined)?.code === "PAID_DOCUMENTS"
          ? t("accountHasPaidDocumentsError")
          : error instanceof Error
            ? error.message
            : t("accountUpdateError");
      toast.error(message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t("accountsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {visibleAccounts.map((acc, idx) => {
            const documentsCount = acc._count?.documents ?? 0;
            const canEdit = !acc.is_deleted && documentsCount === 0;

            return (
              <div key={acc.id}>
                {idx > 0 && <Separator />}
                <div className="flex justify-between items-center py-2">
                  <p className="text-sm">{formatBankAccount(acc.bank_account)}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={acc.is_default}
                        onCheckedChange={async (checked) => {
                          try {
                            await onSetDefault(acc.id, checked);
                          } catch {
                            toast.error(checked ? t("setDefaultAccountError") : t("unsetDefaultAccountError"));
                          }
                        }}
                        disabled={loadingId === acc.id || acc.is_deleted}
                        id={`default-${acc.id}`}
                      />
                      <Label htmlFor={`default-${acc.id}`}>{t("defaultAccount")}</Label>
                    </div>
                    {canEdit && (
                      <Button
                        size="icon"
                        variant="outline"
                        title={t("editAccount")}
                        onClick={() => setEditTarget(acc)}
                        disabled={loadingId === acc.id || editLoading}
                      >
                        <Pencil size={16} />
                      </Button>
                    )}
                    {!canEdit && <span className="inline-flex h-9 w-10 shrink-0" aria-hidden="true" />}
                    <Button
                      size="icon"
                      variant="outline"
                      className={acc.is_deleted ? "bg-green-500" : "bg-red-500"}
                      title={acc.is_deleted ? t("restoreAccount") : t("deleteAccount")}
                      onClick={() => onDelete(acc.id, entityId)}
                      disabled={loadingId === acc.id}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{t("editAccountTitle")}</DialogTitle>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditAccount)} className="space-y-4">
              <Container className="justify-start gap-2">
                <PartnerInput<EditForm>
                  control={editForm.control}
                  name="bank_account"
                  label={t("bankAccountLabel")}
                  className="bank-account-size"
                />
              </Container>

              <div className="flex gap-2">
                <Button type="submit" disabled={editLoading}>
                  {t("save")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    editForm.reset();
                    setEditTarget(null);
                  }}
                  disabled={editLoading}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
