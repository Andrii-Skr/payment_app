import { Container, FormDatePicker, FormInput } from "@/components/shared";
import { FormValues } from "@/components/shared/paymentForm";
import { Button } from "@/components/ui";
import { CircleX } from "lucide-react";
import React from "react";
import {
  Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { ComputedFormInput } from "@/components/shared/computedFormInput";
import { date } from "zod";

type Props = {
  control: Control<FormValues>;
  onBlur?: () => void;
};

const SumAndDateForm: React.FC<Props> = ({ control, onBlur }) => {
  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "payments",
  });
  const { setValue } = useFormContext<FormValues>();
  // Отслеживаем значения accountSum и payments для вычисления остатка
  const accountSum = useWatch({ control, name: "accountSum" });
  const payments = useWatch({ control, name: "payments" });
  const totalPayments = (payments || []).reduce(
    (acc: number, curr: any) => acc + (Number(curr.paySum) || 0),
    0
  );
  const remainder = (Number(accountSum) || 0) - totalPayments;

  return (
    <div>
      <div className="col-span-3 mb-2 flex justify-start">
        <Button
          type="button"
          onClick={() =>
            prepend({
              paySum: 0,
              expectedDate: undefined,
              deadLineDate: undefined,
              isPaid: false,
              paidDate: undefined,
            })
          }
        >
          Добавить платеж
        </Button>
      </div>

      {/* Вывод вычисленного остатка */}
      <div>
        {fields.map((field, index) => {
          const payment = payments && payments[index];
          const isPaid = payment ? payment.isPaid : false;
          return (
            <div
              key={field.id}
              className="w-auto rounded-3xl border-gray-200 border-2 ml-[-20px] p-4"
            >
              <Container className="justify-start items-start gap-5 pb-2">
                <ComputedFormInput
                  label="Остаток"
                  description="Остаток: Сумма счета минус сумма платежей"
                  value={remainder}
                />

                <div className="relative">
                  <FormInput
                    className="no-spin pr-12"
                    control={control}
                    type="number"
                    name={`payments.${index}.paySum`}
                    label="Сумма оплаты"
                    description="Сумма, которую нужно оплатить"
                    readOnly={isPaid}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-11 transform -translate-y-4  rounded text-xs font-bold"
                    disabled={isPaid}
                    onClick={() => {
                      if (remainder > 0) {
                        setValue(`payments.${index}.paySum`, remainder, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  >
                    MAX
                  </Button>
                </div>
                {isPaid ? (
                  <FormDatePicker
                    control={control}
                    name={`payments.${index}.paidDate`}
                    label="Дата оплаты"
                    description="Дата оплаты"
                    readOnly={isPaid}
                  />
                ) : (
                  <></>
                )}
              </Container>
              <Container className="justify-start gap-5">
                <FormDatePicker
                  control={control}
                  name={`payments.${index}.expectedDate`}
                  label="Желаемая дата"
                  description="Желательно заплатить до"
                  readOnly={isPaid}
                />

                <FormDatePicker
                  control={control}
                  name={`payments.${index}.deadLineDate`}
                  label="Крайний срок"
                  description="Крайний срок оплаты счета"
                  readOnly={isPaid}
                />

                <Button
                  type="button"
                  className="text-red-500 mt-7"
                  variant="ghost"
                  disabled={isPaid}
                  onClick={() => remove(index)}
                >
                  <CircleX className="mr-2" /> Удалить
                </Button>
              </Container>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { SumAndDateForm };
