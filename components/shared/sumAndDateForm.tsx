import {
  Container,
  FormDatePicker,
  FormInput,
  ComputedFormInput,
  RegularPaymentDialog,
} from "@/components/shared";
import { FormValues } from "@/types/formTypes";
import { Button } from "@/components/ui";
import { apiClient } from "@/services/api-client";
import { CircleX, Repeat1 } from "lucide-react";
import React from "react";
import {
  Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";

type Props = {
  control: Control<FormValues>;
  onBlur?: () => void;
};

const SumAndDateForm: React.FC<Props> = ({ control, onBlur }) => {
  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "payments",
  });
  const { setValue, getValues } = useFormContext<FormValues>();

  // Состояния для AlertDialog
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = React.useState<
    number | null
  >(null);

  // Отслеживаем значения accountSum и payments для вычисления остатка
  const accountSum = useWatch({ control, name: "accountSum" });
  const payments = useWatch({ control, name: "payments" });

  // Суммируем все платежи
  const totalPayments = (payments || []).reduce(
    (acc: number, curr: any) => acc + (Number(curr.paySum) || 0),
    0
  );

  const cleanedAccountSum = Number(String(accountSum).replace(/,/g, ".")) || 0;
  const rawRemainder = cleanedAccountSum - Number(totalPayments);
  const remainder = Number(rawRemainder.toFixed(2));

  // Обработчик для поля paySum при потере фокуса
  const handlePaySumBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (value.includes(",")) {
      const newValue = value.replace(/,/g, ".");
      setValue(`payments.${index}.paySum`, Number(newValue), {
        shouldValidate: true,
      });
    }
  };

  // Функция для обработки подтверждения в диалоге
  const handleConfirmRegular = () => {
    if (selectedPaymentIndex !== null) {
      const currentPayment = getValues(`payments.${selectedPaymentIndex}`);
      console.log("currentPayment", currentPayment);
      setValue(`is_auto_payment`, true);
      apiClient.autoPayment.create(currentPayment);
    }
    setAlertOpen(false);
    setSelectedPaymentIndex(null);
  };

  return (
    <div>
      <Container className="col-span-3 mb-2 gap-10 flex justify-start">
        <Button
          type="button"
          tabIndex={-1}
          onClick={() =>
            prepend({
              paySum: 0,
              expectedDate: null,
              deadLineDate: null,
              isPaid: false,
            })
          }
        >
          Добавить платеж
        </Button>
        <Button type="submit" tabIndex={-1}>Сохранить</Button>
      </Container>

      {/* Вывод вычисленного остатка */}
      <div>
        {fields.map((field, index) => {
          const payment = payments && payments[index];
          const isPaid = payment ? payment.isPaid : false;
          return (
            <div
              key={field.id}
              className="w-auto rounded-3xl border-gray-200 border-2 ml-[-20px] p-3"
            >
              <Container className="justify-start items-start gap-5 pb-2">
                <ComputedFormInput
                  label="Остаток"
                  description="Сумма счета минус сумма платежей"
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
                    onBlur={(e) => handlePaySumBlur(e, index)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-11 transform -translate-y-4 rounded text-xs font-bold"
                    disabled={isPaid}
                    onClick={() => {
                      if (remainder > 0) {
                        setValue(
                          `payments.${index}.paySum`,
                          remainder +
                            Number(getValues(`payments.${index}.paySum`)),
                          { shouldValidate: true }
                        );
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
                ) : getValues(`payments.${index}.documents_id`) &&
                  !getValues(`is_auto_payment`) ? (
                  <Button
                    type="button"
                    tabIndex={-1}
                    className="mt-7"
                    variant="ghost"
                    disabled={isPaid}
                    onClick={() => {
                      setSelectedPaymentIndex(index);
                      setAlertOpen(true);
                    }}
                  >
                    <Repeat1 className="mr-2" />
                    Сделать регулярным
                  </Button>
                ) : null}
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
                  tabIndex={-1}
                  className="text-red-500 mt-[29]"
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

      {/* Использование вынесенного компонента для AlertDialog */}
      <RegularPaymentDialog
        open={alertOpen}
        paySum={
          selectedPaymentIndex !== null
            ? getValues(`payments.${selectedPaymentIndex}.paySum`)
            : ""
        }
        onOpenChange={setAlertOpen}
        onConfirm={handleConfirmRegular}
      />
    </div>
  );
};

export { SumAndDateForm };
