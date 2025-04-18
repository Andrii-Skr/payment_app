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
  Form
} from "@/components/ui";
import { toast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  entityIdNum: number;
  className?: string;
};

const formSchema = z.object({
  entity_id: z.number(),
  name: z.string().nonempty("Имя обязательно"),
  edrpou: z.string().nonempty("ЕДРПОУ обязательно"),
  accountNumber: z.string().nonempty("Номер счета обязателен"),
});

export type PartnerValues = z.infer<typeof formSchema>;

export const AddPartner: React.FC<Props> = ({ className, entityIdNum }) => {
  const defaultValues = {
    entity_id: entityIdNum,
    name: "",
    edrpou: "",
    accountNumber: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const existing = await apiClient.partners.getByEdrpou(data.edrpou, data.entity_id);

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
        <Button type="button" variant="ghost" tabIndex={-1} className={cn("", className)}>
          <CirclePlus className="mr-2" />
          Добавить контрагента
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
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
            <Container className="gap-2">
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
            </Container>
            <Container className="justify-start ml-12 gap-2">
              <PartnerInput
                control={form.control}
                name="accountNumber"
                label="Номер счета"
                placeholder="Введите номер счета"
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
