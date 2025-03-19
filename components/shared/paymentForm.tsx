"use client";

import {
  Alert,
  AlertDescription,
  Button,
  Form,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Container } from "@/components/shared/container";
import {
  AccountsCombobox,
  AddPartner,
  FormDatePicker,
  FormInput,
  PartnersCombobox,
  SampleCombobox,
  SumAndDateForm,
} from "@/components/shared";
import { apiClient } from "@/services/api-client";
import { TransformedObject } from "@/transformData/doc";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import type { partner_account_number, documents, entity } from "@prisma/client";

const paymentSchema = z.object({
  paySum: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        // Заменяем запятую на точку для корректного преобразования
        value = value.replace(/,/g, ".");
      }
      return value === "" ? 0 : Number(value);
    },
    z.number().min(0.1, "Сумма должна быть больше 0")
  ),
  isPaid: z.boolean().optional(),
  paidDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.date().optional()),
  expectedDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.date().optional()),
  deadLineDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.date({ message: "Пожалуйста, выберите дату" }).optional()),
});

const formSchema = z.object({
  doc_id: z.number().optional(),
  entity_id: z.number(),
  partner_id: z.number(),
  sample: z.string().optional(),
  accountNumber: z
    .string({ message: "Пожалуйста, заполните это поле" })
    .min(2, { message: "Номер счета должен быть не менее 2 символов." }),
  date: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
    return arg;
  }, z.date({ message: "Пожалуйста, выберите дату" })),
  accountSum: z
    .string()
    // Разрешаем цифры, запятую и арифметические знаки
    .regex(/^(=)?[0-9,\-+*/().\s]+$/, "Сумма должна состоять только из цифр"),
  accountSumExpression: z.string().optional(),
  payments: z.array(paymentSchema),
  edrpou: z.string().length(8, { message: "ЕДРПОУ должен быть 8 цифр" }),
  selectedAccount: z.string().nonempty("Выберите номер счета"),
  mfo: z.string(),
  partnerName: z.string(),
  purposeOfPayment: z.string().max(420, {
    message: "Примечание должно быть не более 420 символов.",
  }),
  note: z.string().optional(),
});

export type PaymentValues = z.infer<typeof paymentSchema>;
export type FormValues = z.infer<typeof formSchema>;

type Props = {
  className?: string;
};

export const PaymentForm: React.FC<Props> = ({ className }) => {
  // Извлекаем entityId из маршрута и преобразуем в число
  const { entity_id } = useParams();
  const entityIdNum = Number(entity_id);

  const router = useRouter();

  // Загружаем данные сущности для отображения наименования плательщика
  const [entity, setEntity] = React.useState<entity | null>(null);
  const [accountList, setAccountList] = React.useState<partner_account_number[] | []>([]);
  const [docs, setDocs] = React.useState<documents[] | []>([]);

  const defaultValues = {
    doc_id: undefined,
    entity_id: entityIdNum,
    sample: "",
    accountNumber: "",
    date: undefined,
    expectedDate: undefined,
    deadLineDate: undefined,
    accountSum: "0",
    accountSumExpression: "",
    paySum: 0,
    edrpou: "",
    payments: [
      {
        paySum: 0,
        expectedDate: undefined,
        deadLineDate: undefined,
        isPaid: false,
        paidDate: undefined,
      },
    ],
    selectedAccount: "",
    partner_id: 0,
    partnerName: "",
    purposeOfPayment: "",
    note: "",
    mfo: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    shouldUnregister: true,
  });
  const { setValue, reset, watch, getValues } = form;
  const partner_id = watch("partner_id");

  // Загружаем данные сущности по id
  React.useEffect(() => {
    if (entityIdNum) {
      apiClient.entity.getEntityById(entityIdNum).then((data) => {
        if (data) {
          setEntity(data);
        }
      });
    }
  }, [entityIdNum]);

  // Устанавливаем значение entity_id из маршрута
  React.useEffect(() => {
    setValue("entity_id", entityIdNum);
  }, [entityIdNum, setValue]);

  // Загружаем документы, связанные с сущностью
  React.useEffect(() => {
    if (entityIdNum) {
      apiClient.document.getByEntity(entityIdNum).then((data) => {
        if (data) {
          setDocs(data);
        }
      });
    }
  }, [entityIdNum, partner_id]);

  const onSubmit = (data: FormValues) => {
    console.log("data", data);
    if (!data.doc_id) {
      apiClient.document.create(data);
    } else {
      apiClient.document.update(data);
    }
    reset({ ...defaultValues, entity_id: entityIdNum });
  };

  const ClickHandle = (doc_id: number) => {
    apiClient.document.getById(doc_id).then((data) => {
      if (data) {
        const transformedData = TransformedObject(data);
        // router.push(`/create/payment-form/${transformedData.entity_id}`);
        reset(transformedData);
      }
    });
  };

  // Обработчик потери фокуса для accountSum:
  // 1. Если значение начинается с "=", заменяем запятые на точки в выражении,
  //    сохраняем его и вычисляем результат.
  // 2. Иначе, заменяем запятые на точки, приводим к числу и округляем до 2 знаков.
  const handleAccountSumBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.startsWith("=")) {
      // Заменяем запятые на точки в выражении
      value = value.replace(/,/g, ".");
      setValue("accountSumExpression", value);
      try {
        const expr = value.slice(1); // удаляем знак "="
        const result = new Function("return " + expr)();
        const rounded = Number(result).toFixed(2);
        setValue("accountSum", rounded);
      } catch (error) {
        console.error("Ошибка при вычислении выражения", error);
      }
    } else {
      // Заменяем запятые на точки
      const newValue = value.replace(/,/g, ".");
      const num = Number(newValue);
      if (!isNaN(num)) {
        const rounded = num.toFixed(2);
        setValue("accountSum", rounded);
      } else {
        setValue("accountSum", newValue);
      }
    }
  };

  // При двойном клике восстанавливаем исходное выражение
  const handleAccountSumDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const expression = getValues("accountSumExpression");
    if (expression) {
      setValue("accountSum", expression);
    }
  };

  return (
    <div className="flex flex-row justify-around">
      <aside className={cn("w-[30dvw] space-y-2 rounded-3xl border-gray-200 border-2 mr-[30px] p-4", className)}>
        <ScrollArea className="w-auto overflow-y-auto">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Назначение платежа</TableHead>
                  <TableHead>Дата счета</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...docs]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          className="justify-start w-full text-sm"
                          onClick={() => ClickHandle(doc.id)}
                        >
                          {doc.account_number}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(doc.date).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </aside>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Валидация не пройдена:", errors);
          })}
          className="space-y-2 w-auto"
        >
          <Alert>
            <AlertDescription className="w-auto">
              Наименование Плательщика: {entity?.name || "Загрузка..."}
            </AlertDescription>
          </Alert>
          <SampleCombobox
            control={form.control}
            name="sample"
            label="Шаблон"
            placeholder="Выберите шаблон ..."
            empty="Шаблоны не найдены =("
          />
          <Container className="justify-start items-start gap-5">
            <FormInput
              control={form.control}
              className="no-spin"
              type="text"
              name="accountSum"
              label="Сумма счета"
              description="Сумма, указанная в счете"
              onBlur={handleAccountSumBlur}
              onDoubleClick={handleAccountSumDoubleClick}
            />
            <FormInput
              control={form.control}
              name="accountNumber"
              label="Номер счета"
              placeholder="Введите номер счета"
              description="Номер указанный в счете"
            />
            <FormDatePicker
              control={form.control}
              name="date"
              label="Дата счета"
              description="Дата указанная в счете"
            />
          </Container>
          <Container className="justify-start items-start gap-5">
            <FormInput
              control={form.control}
              name="purposeOfPayment"
              label="Назначение платежа"
              placeholder=""
              description="Назначение платежа"
            />
            <FormInput
              control={form.control}
              name="note"
              label="Комментарий к платежу"
              placeholder=""
              description="Комментарий к счету"
            />
          </Container>
          <div className="w-auto rounded-3xl border-gray-200 border-2 ml-[-20px] p-4">
            <Container className="justify-start gap-5 pb-2">
              <PartnersCombobox
                control={form.control}
                name="edrpou"
                label="ЕДРПОУ"
                placeholder="Выберите ЕДРПОУ..."
                empty="ЕДРПОУ не найдены =("
                id={entityIdNum}
              />
              <AccountsCombobox
                control={form.control}
                name="selectedAccount"
                label="Номер счета"
                placeholder="Выберите Номер счета..."
                empty="Номера счетов не найдены =("
                data={accountList}
              />
              <AddPartner className="self-end" />
            </Container>
            <Container className="justify-start gap-5">
              <FormInput
                control={form.control}
                name="partnerName"
                label="Имя контрагента"
              />
              <FormInput
                control={form.control}
                className="no-spin"
                name="mfo"
                label="МФО"
                type="number"
              />
            </Container>
          </div>
          <SumAndDateForm control={form.control} />
          <Container className="justify-start items-start gap-5">
            <Button type="submit">Сохранить</Button>
          </Container>
        </form>
      </Form>
    </div>
  );
};
