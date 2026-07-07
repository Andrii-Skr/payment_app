"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container, PartnerInput } from "@/components/shared";
import { Button, Checkbox, Form, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/lib/hooks/use-toast";
import { bankAccountSchema } from "@/lib/validators/bankAccount";
import { apiClient } from "@/services/api-client";
import type { AddBankAccountResponse, PartnersWithAccounts } from "@/services/partners";
import type { AccountItem } from "@/store/accountListStore";

const addAccountSchema = z.object({
  bank_account: bankAccountSchema,
  additional_entity_ids: z.array(z.number()).default([]),
});

type AddAccountValues = z.infer<typeof addAccountSchema>;

const toAccountItem = (response: AddBankAccountResponse, entityId: number): AccountItem => {
  const relation = response.created.entities.find((item) => item.entity_id === entityId);

  return {
    ...response.created,
    is_default: relation?.is_default ?? false,
    is_visible: relation?.is_visible ?? true,
    is_deleted: relation?.is_deleted ?? false,
  } as AccountItem;
};

type Props = {
  entityId: number;
  onAccountAdded: (account: AccountItem) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  partner: PartnersWithAccounts;
};

export function AddPartnerAccountDialog({ entityId, onAccountAdded, onOpenChange, open, partner }: Props) {
  const t = useTranslations("adminPartners");
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<AddAccountValues>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: {
      bank_account: "",
      additional_entity_ids: [],
    },
  });

  const otherEntities = useMemo(
    () =>
      partner.entities
        .filter((relation) => relation.entity_id !== entityId && !relation.is_deleted && !relation.entity.is_deleted)
        .map((relation) => ({
          id: relation.entity_id,
          name: relation.entity.short_name || relation.entity.full_name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [entityId, partner.entities],
  );

  const handleSubmit = async (values: AddAccountValues) => {
    setSubmitting(true);
    try {
      const result = await apiClient.partners.addBankAccount({
        partner_id: partner.id,
        entity_id: entityId,
        additional_entity_ids: values.additional_entity_ids,
        bank_account: values.bank_account,
      });

      if (result.message) {
        toast.info(result.message);
      }

      onAccountAdded(toAccountItem(result, entityId));

      const linkedAdditionalCount = result.linked_entity_ids.filter((id) => id !== entityId).length;
      const skippedAdditionalCount = result.skipped_entity_ids.filter((id) => id !== entityId).length;

      if (linkedAdditionalCount > 0 || skippedAdditionalCount > 0) {
        toast.success(
          t("addAccountResult", {
            linked: linkedAdditionalCount,
            skipped: skippedAdditionalCount,
          }),
        );
      } else {
        toast.success(t("accountAdded"));
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("accountAddError");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t("addAccountDialogTitle")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex min-h-0 flex-1 flex-col gap-4">
            <Container className="justify-start gap-2">
              <PartnerInput<AddAccountValues>
                control={form.control}
                name="bank_account"
                label={t("bankAccountLabel")}
                className="bank-account-size"
              />
            </Container>

            <div className="min-h-0 flex-1 rounded-lg border p-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{t("additionalEntitiesTitle")}</p>
                  <p className="text-sm text-muted-foreground">{t("additionalEntitiesDescription")}</p>
                </div>

                {otherEntities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noOtherEntities")}</p>
                ) : (
                  <FormField
                    control={form.control}
                    name="additional_entity_ids"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="always-visible-scrollbar max-h-[min(24rem,45vh)] space-y-3 overflow-y-scroll pr-3">
                          {otherEntities.map((otherEntity) => {
                            const checked = field.value.includes(otherEntity.id);

                            return (
                              <label
                                key={otherEntity.id}
                                className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2"
                                htmlFor={`additional-entity-${otherEntity.id}`}
                              >
                                <Checkbox
                                  id={`additional-entity-${otherEntity.id}`}
                                  checked={checked}
                                  onCheckedChange={(nextChecked) => {
                                    field.onChange(
                                      nextChecked
                                        ? [...field.value, otherEntity.id]
                                        : field.value.filter((id) => id !== otherEntity.id),
                                    );
                                  }}
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium">{otherEntity.name}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        <FormDescription>{t("additionalEntitiesHint")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button type="submit" disabled={submitting}>
                {t("save")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={submitting}
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
