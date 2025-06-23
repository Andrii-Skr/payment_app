"use client";
import { useEffect, useState } from "react";
import { useFormContext, useWatch, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PartnerInput, Container } from "@/components/shared";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
} from "@/components/ui";
import { CirclePlus } from "lucide-react";

import { createPartner, addBankAccount, updatePartner } from "@/services/partners";
import { apiClient } from "@/services/api-client";
import { useAccountListStore } from "@/store/accountListStore";
import { usePartnersStore } from "@/store/partnersStore";
import { PartnerAccountsList } from "@/components/payment-form/partnerAccountsList";
import { FormValues } from "@/types/formTypes";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  entity_id: z.number(),
  full_name: z.string().min(3),
  short_name: z.string().min(3),
  edrpou: z
    .string()
    .min(8)
    .max(10)
    .regex(/^\d+$/, "ЕДРПОУ должен содержать только цифры"),
  bank_account: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().length(29).optional()
  ),
  mfo: z.string().optional(),
  bank_name: z.string().optional(),
});

export type PartnerValues = z.infer<typeof formSchema>;

type Props = {
  entityIdNum: number;
  className?: string;
};

export const AddPartner: React.FC<Props> = ({ entityIdNum, className }) => {
  const parentForm = useFormContext<FormValues>();
  const { fetchPartners } = usePartnersStore();
  const { currentAccountList } = useAccountListStore();
  const partnerId = parentForm.watch("partner_id") ?? undefined;

  const [open, setOpen] = useState(false);
  const [showAccountsList, setShowAccountsList] = useState(false);

  const internalForm = useForm<PartnerValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entity_id: entityIdNum,
      full_name: "",
      short_name: "",
      edrpou: "",
      bank_account: "",
      mfo: "",
      bank_name: "",
    },
  });

  const watchedEdrpou = useWatch({
    control: internalForm.control,
    name: "edrpou",
  });

  // 1️⃣ при открытии — инициализируем и fetch-им
  useEffect(() => {
    if (!open) return;

    const edrpou = parentForm.getValues("edrpou");
    const short = parentForm.getValues("short_name");
    const full = parentForm.getValues("full_name");

    internalForm.setValue("entity_id", entityIdNum);
    internalForm.setValue("edrpou", edrpou);
    internalForm.setValue("short_name", short);
    internalForm.setValue("full_name", full);

    setShowAccountsList(!!edrpou);
    fetchPartners(entityIdNum);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!watchedEdrpou || watchedEdrpou.length < 8) return;

    const fillFromOther = async () => {
      try {
        const entities = await apiClient.entities.getAll();
        for (const ent of entities) {
          if (ent.id === entityIdNum) continue;
          const partner = await apiClient.partners.getByEdrpou(
            watchedEdrpou,
            ent.id
          );
          if (partner) {
            internalForm.setValue("full_name", partner.full_name);
            internalForm.setValue("short_name", partner.short_name);
            break;
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fillFromOther();
  }, [watchedEdrpou, open]);

  // 2️⃣ после обновления списка — подставляем актуальный основной счёт
  useEffect(() => {
    if (!open) return;

    const defaultAcc = currentAccountList.find((a) => a.is_default);
    if (!defaultAcc) return;

    const alreadySelected = parentForm.getValues("selectedAccount");
    const selectedId = parentForm.getValues("partner_account_number_id");
    if (alreadySelected || selectedId) return;

    internalForm.setValue("bank_account", defaultAcc.bank_account);
    parentForm.setValue("selectedAccount", defaultAcc.bank_account);
    parentForm.setValue("partner_account_number_id", defaultAcc.id);
  }, [currentAccountList, open]);

  const edrpou = parentForm.getValues("edrpou");
  const readonlyEdrpou = !!edrpou;

  const onSubmit = async (data: PartnerValues) => {
    const isEdit = !!parentForm.getValues("partner_account_number_id");

    if (!isEdit && !data.bank_account) {
      internalForm.setError("bank_account", {
        type: "validate",
        message: "Укажите номер счёта",
      });
      return;
    }
    try {
      if (isEdit) {
        const id = parentForm.getValues("partner_id");
        if (id) {
          await updatePartner(id, {
            full_name: data.full_name,
            short_name: data.short_name,
          });
        }

        await fetchPartners(data.entity_id);
        internalForm.reset();
        toast.success("Сохранено успешно.");
      } else {
        const { partner, reused } = await createPartner(data);

        const addRes =
          reused && data.bank_account
            ? await addBankAccount({
                partner_id: partner.id,
                entity_id: data.entity_id,
                bank_account: data.bank_account,
                mfo: data.mfo,
                bank_name: data.bank_name,
                is_default: false,
              })
            : null;

        if (addRes?.message) {
          toast.error(addRes.message);
        }

        const bankAccount =
          reused && data.bank_account
            ? addRes!.created
            : partner.partner_account_number[0];

        parentForm.setValue("selectedAccount", bankAccount.bank_account);
        parentForm.setValue("partner_account_number_id", bankAccount.id);

        await fetchPartners(data.entity_id);
        internalForm.reset();
        toast.success("Сохранено успешно.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при сохранении.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          tabIndex={-1}
          size={"sm"}
          className={cn("", className)}
        >
          <CirclePlus className="mr-2" />
          Добавить / Изменить
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[840px]">
        <DialogHeader>
          <DialogTitle>Контрагент</DialogTitle>
          <DialogDescription>
            Укажите или обновите данные контрагента и счёт.
          </DialogDescription>
        </DialogHeader>

        <Form {...internalForm}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              internalForm.handleSubmit(onSubmit, (errors) => {
                console.error("Валидация не прошла:", errors);
              })(e);
            }}
            className="space-y-4"
          >
            <Container className="justify-start gap-2">
              <PartnerInput
                control={internalForm.control}
                name="full_name"
                label="Полное имя"
                className="bank-account-size"
              />
              <PartnerInput
                control={internalForm.control}
                name="short_name"
                label="Короткое имя"
              />
              <PartnerInput
                control={internalForm.control}
                name="edrpou"
                label="ЕДРПОУ"
                readOnly={readonlyEdrpou}
              />
            </Container>

            {!showAccountsList && (
              <Container className="justify-start gap-2">
                <PartnerInput
                  control={internalForm.control}
                  name="bank_account"
                  label="Номер счета"
                  className="bank-account-size"
                />
              </Container>
            )}

            <DialogFooter>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>

          <PartnerAccountsList
            show={showAccountsList}
            entityId={entityIdNum}
            partnerId={partnerId}
            hideDelete={true}
            onDefaultChange={({ bank_account, id }) => {
              parentForm.setValue("selectedAccount", bank_account);
              parentForm.setValue("partner_account_number_id", id);
            }}
          />
        </Form>
      </DialogContent>
    </Dialog>
  );
};
