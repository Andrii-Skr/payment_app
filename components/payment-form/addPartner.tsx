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

import { createPartner, addBankAccount } from "@/services/partners";
import { useAccountListStore } from "@/store/store";
import { usePartnersStore } from "@/store/partnersStore";
import { PartnerAccountsList } from "@/components/payment-form/partnerAccountsList";
import { FormValues } from "@/types/formTypes";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  entity_id: z.number(),
  full_name: z.string().min(3),
  short_name: z.string().min(3),
  edrpou: z.string().min(8).max(10),
  bank_account: z.string().length(29),
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

  // 2️⃣ после обновления списка — подставляем актуальный основной счёт
  useEffect(() => {
    if (!open) return;

    const defaultAcc = currentAccountList.find((a) => a.is_default);
    if (defaultAcc) {
      internalForm.setValue("bank_account", defaultAcc.bank_account);
      parentForm.setValue("selectedAccount", defaultAcc.bank_account);
      parentForm.setValue("partner_account_number_id", defaultAcc.id);
    }
  }, [currentAccountList, open]);

  const edrpou = parentForm.getValues("edrpou");
  const readonlyEdrpou = !!edrpou;

  const onSubmit = async (data: PartnerValues) => {
    try {
      const partner = await createPartner(data);

      const bankAccount = await addBankAccount({
        partner_id: partner.id,
        bank_account: data.bank_account,
        mfo: data.mfo,
        bank_name: data.bank_name,
        is_default: false,
      });

      parentForm.setValue("selectedAccount", bankAccount.bank_account);
      parentForm.setValue("partner_account_number_id", bankAccount.id);

      await fetchPartners(data.entity_id);
      internalForm.reset();
      toast.success("Сохранено успешно.");
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

            <Container className="justify-start gap-2">
              <PartnerInput
                control={internalForm.control}
                name="bank_account"
                label="Номер счета"
                className="bank-account-size"
              />
            </Container>

            <DialogFooter>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>

            <PartnerAccountsList
              show={showAccountsList}
              onDefaultChange={({ bank_account, id }) => {
                parentForm.setValue("selectedAccount", bank_account);
                parentForm.setValue("partner_account_number_id", id);
              }}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
