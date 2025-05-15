"use client";
import { useEffect, useState } from "react";
import { useFormContext, useForm } from "react-hook-form";
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

import {
  createPartner,
  updatePartner,
  getByEdrpou,
  addBankAccount,
} from "@/services/partners";

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
  const { updateAccountList } = useAccountListStore();

  const [open, setOpen] = useState(false);

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

  // 🔄 Автозаполнение значений при открытии
  useEffect(() => {
    if (!open) return;

    const edrpou = parentForm.getValues("edrpou");
    const short = parentForm.getValues("short_name");
    const full = parentForm.getValues("full_name");
    const account = parentForm.getValues("selectedAccount");

    internalForm.setValue("entity_id", entityIdNum);
    internalForm.setValue("edrpou", edrpou);
    internalForm.setValue("short_name", short);
    internalForm.setValue("full_name", full);
    internalForm.setValue("bank_account", account);

    if (edrpou) {
      getByEdrpou(edrpou, entityIdNum).then((partner) => {
        if (!partner) return;

        updateAccountList(partner.partner_account_number);

        const defaultAcc = partner.partner_account_number.find(
          (a) => a.is_default
        );
        if (defaultAcc) {
          internalForm.setValue("bank_account", defaultAcc.bank_account);
          internalForm.setValue("mfo", defaultAcc.mfo ?? "");
          internalForm.setValue("bank_name", defaultAcc.bank_name ?? "");
        }
      });
    }
  }, [open]);

  const onSubmit = async (data: PartnerValues) => {
    try {
      const existing = await getByEdrpou(data.edrpou, data.entity_id);

      if (existing) {
        await updatePartner(existing.id, {
          full_name: data.full_name,
          short_name: data.short_name,
        });

        await addBankAccount({
          partner_id: existing.id,
          bank_account: data.bank_account,
          mfo: data.mfo,
          bank_name: data.bank_name,
          is_default: false,
        });
      } else {
        await createPartner(data);
      }

      await fetchPartners(data.entity_id);

      // 🧠 Обновление основной формы
      const updatedPartner = await getByEdrpou(data.edrpou, data.entity_id);
      if (updatedPartner) {
        const defaultAcc = updatedPartner.partner_account_number.find(
          (a) => a.is_default
        );
        if (defaultAcc) {
          parentForm.setValue("partner_id", updatedPartner.id);
          parentForm.setValue("selectedAccount", defaultAcc.bank_account);
          parentForm.setValue("partner_account_number_id", defaultAcc.id);
        }
      }

      internalForm.reset();
      setOpen(false);
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
              />
            </Container>

            <Container className="justify-start gap-2">
              <PartnerInput
                control={internalForm.control}
                name="bank_account"
                label="Номер счета"
                className="bank-account-size"
              />
              {/* <PartnerInput
                control={internalForm.control}
                name="mfo"
                label="МФО"
              />
              <PartnerInput
                control={internalForm.control}
                name="bank_name"
                label="Банк"
              /> */}
            </Container>

            <DialogFooter>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>

            <PartnerAccountsList />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
