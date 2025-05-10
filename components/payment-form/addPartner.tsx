"use client";
import { Container, FormInput, PartnerInput } from "@/components/shared";
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
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAutoFillBankDetails } from "@/lib/hooks/useAutoFillBankDetails";
import { z } from "zod";
import React from "react";

type Props = {
  entityIdNum: number;
  className?: string;
};

const formSchema = z.object({
  entity_id: z.number(),
  name: z.string().min(3, "Контрагент обязателен"),
  edrpou: z.string().min(8,"ЕДРПОУ должен состоять из 8 или 10 символов").max(10, "ЕДРПОУ должен состоять из 8 или 10 символов"),
  bank_account: z.string().min(29, "Счет должен состоять из 29 символов"),
  mfo: z.string(),
  bank_name: z.string(),
});

export type PartnerValues = z.infer<typeof formSchema>;

export const AddPartner: React.FC<Props> = ({ className, entityIdNum }) => {
  const defaultValues = {
    entity_id: entityIdNum,
    name: "",
    edrpou: "",
    bank_account: "",
    mfo: "",
    bank_name: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const bankAccountValue = form.watch("bank_account");
  const { mfo, bankName } = useAutoFillBankDetails(bankAccountValue);

  React.useEffect(() => {
    if (mfo) form.setValue("mfo", mfo);
    if (bankName) form.setValue("bank_name", bankName);
  }, [mfo, bankName, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const existing = await apiClient.partners.getByEdrpou(
        data.edrpou,
        data.entity_id
      );
      console.log("existing", existing);
      if (existing) {
        toast.error("Контрагент с таким ЕДРПОУ уже существует.");
        return;
      }

      await apiClient.partners.createPartner(data);
      toast.success("Контрагент добавлен.");
      form.reset(defaultValues); // сброс после успешного добавления
    } catch (err) {
      console.error("Ошибка при создании контрагента:", err);
      toast.error("Произошла ошибка при добавлении.");
    }
  };

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (isOpen) form.reset(defaultValues); // сброс при открытии
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          tabIndex={-1}
          className={cn("", className)}
        >
          <CirclePlus className="mr-2" />
          Добавить контрагента
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[815px]">
        <DialogHeader>
          <DialogTitle>Добавить контрагента</DialogTitle>
          <DialogDescription>
            Введите данные контрагента. Нажмите "Добавить", когда закончите.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              form.handleSubmit(onSubmit, (errors) => {
                console.error("Валидация не прошла:", errors);
              })(e);
            }}
            className="space-y-4"
          >
            <Container className="justify-start gap-2">
              <PartnerInput
                control={form.control}
                name="name"
                label="Контрагент"
                placeholder="Введите название контрагента"
              />
              <PartnerInput
                control={form.control}
                name="edrpou"
                label="ЕДРПОУ"
                placeholder="Введите ЕДРПОУ"
              />
              <PartnerInput
                control={form.control}
                name="bank_account"
                label="Номер счета"
                className="w-[260px]"
                placeholder="UA1234..."
              />
            </Container>
            <Container className="justify-start gap-2">
              <PartnerInput
                control={form.control}
                name="mfo"
                label="МФО"
                placeholder="Введите МФО"
                readOnly
              />
              <PartnerInput
                control={form.control}
                name="bank_name"
                label="Название банка"
                placeholder="Введите название банка"
                readOnly
              />
            </Container>
            <DialogFooter>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
