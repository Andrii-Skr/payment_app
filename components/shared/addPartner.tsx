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
  Input,
  Label,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useEntityStore } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  className?: string;
};

// const accountSchema = z.object({
//   accountNumber: z.string(),
//   isDefault: z.boolean(),
//   isDeleted: z.boolean(),
//   mfo: z.string()
// })

// const synonymSchema = z.object({
//   name: z.string(),
//   isDeleted: z.boolean(),
// })

// const formSchema = z.object({
//   name: z.string().nonempty("Имя обязательно"),
//   edrpou: z.string().nonempty("ЕДРПОУ обязательно"),

//   accList: z.array(accountSchema),
//   synonymList: z.array(synonymSchema)
// });

const formSchema = z.object({
  name: z.string().nonempty("Имя обязательно"),
  edrpou: z.string().nonempty("ЕДРПОУ обязательно"),
  accountNumber: z.string().nonempty("Номер счета обязателен"),
  mfo: z.string().nonempty("MFO обязательно"),
  synonymName: z.string().optional(),
});

export type PartnerValues = z.infer<typeof formSchema>;

export const AddPartner: React.FC<Props> = ({ className }) => {

  const currentEntity = useEntityStore((state) => state.currentEntity);

  // const defaultValues = {
  //   entity_id:currentEntity?.id,
  //   name: "",
  //   edrpou: "",
  //   accList: [{accountNumber: "", isDefault: false, isDeleted: false, mfo: ""}],
  //   synonymList: [{name: "", isDeleted: false}]
  // };
  const defaultValues = {
    name: "",
    edrpou: "",
    accountNumber: "",
    mfo: "",
    synonymName: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("Форма отправлена:", data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className={cn("", className)}>
          <CirclePlus className="mr-2" />
          Добавить контрагента
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Добавить контрагента</DialogTitle>
          <DialogDescription>
            Введите данные контрагента. Нажмите "Добавить" когда закончите.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Container className="gap-2">
            <PartnerInput
              control={form.control}
              name="accountNumber"
              label="Номер счета"
              placeholder="Введите Номер счета"
              />
            <PartnerInput
              control={form.control}
              name="mfo"
              label="МФО"
              placeholder="Введите MФO"
              />
              </Container>
              <PartnerInput
              control={form.control}
              name="synonymName"
              label="Синоним контрагента"
              placeholder="Введите синоним контрагента"
              />
        <DialogFooter>
          <Button type="submit">Добавить</Button>
        </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
