import { Container, FormDatePicker, FormInput } from "@/components/shared";
import { FormValues } from "@/components/shared/paymentForm";
import { Button } from "@/components/ui";
import { CircleX } from "lucide-react";
import React from "react";
import {
  Control,
  FieldArrayWithId,
  useFieldArray,
  UseFieldArrayReturn,
} from "react-hook-form";

type Props = {
  control: Control<FormValues>;
  onBlur?: () => void;
};

const SumAndDateForm: React.FC<Props> = ({ control, onBlur }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments", // имя поля из схемы формы
  });

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id} className=" w-auto rounded-3xl border-gray-200 border-2 ml-[-20px] p-4">
          <Container className="justify-start items-center gap-5 pb-2">
            <FormInput
              className="appearance-none"
              control={control}
              type="number"
              name="accountSum"
              label="Сумма счета"
              description="Сумма, указанная в счете"
            />

            <FormInput
              className="appearance-none"
              control={control}
              type="number"
              name={`payments.${index}.paySum`}
              label="Сумма оплаты"
              description="Сумма, которую нужно оплатить"
            />
          </Container>
          <Container className="justify-start gap-5">
          <FormDatePicker
            control={control}
            name={`payments.${index}.expectedDate`}
            label="Желаемая дата"
            description="Желательно заплатить до"
          />


          <FormDatePicker
            control={control}
            name={`payments.${index}.deadLineDate`}
            label="Крайний срок"
            description="Крайний срок оплаты счета"
          />


          <Button
              type="button"
              className="text-red-500 mt-7"
              variant="ghost"

            onClick={() => remove(index)}
          >
            <CircleX className="mr-2"/> Удалить
            </Button>
            </Container>
        </div>
      ))}
      <div className="col-span-3 mt-4 flex justify-start">
        <Button
          type="button"
          onClick={() =>
            append({
              //accountSum: 0,
              paySum: 0,
              expectedDate: new Date(),
              deadLineDate: new Date(),
            })
          }
        >
          Добавить платеж
        </Button>
      </div>
    </div>
  );
};

export { SumAndDateForm };
