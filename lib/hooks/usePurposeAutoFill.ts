import { useEffect } from "react";
import {
  useWatch,
  UseFormSetValue,
  Control,
  FieldValues,
  Path,
} from "react-hook-form";
import { format } from "date-fns";
import { FormValues } from "@/types/formTypes";

export function usePurposeAutoFill<T extends FieldValues>(
  control: Control<FormValues>,
  setValue: UseFormSetValue<FormValues>
) {
  const accountNumber = useWatch({
    control,
    name: "accountNumber",
  });
  const date = useWatch({ control, name: "date" });
  const accountSum = useWatch({
    control,
    name: "accountSum",
  });
  const vatPercent = useWatch({
    control,
    name: "vatPercent",
  });
  const vatType = useWatch({ control, name: "vatType" });
  const purpose = useWatch({
    control,
    name: "purposeOfPayment",
  });

  useEffect(() => {
    if (!accountNumber || !date || !accountSum || vatType === undefined) return;

    const parsedSum = parseFloat(accountSum.toString());
    const formattedDate = format(new Date(date), "dd.MM.yyyy");

    let autoNote = `${accountNumber} від ${formattedDate},`;
    if (vatType === true && vatPercent != null) {
      const vatAmount = +(
        parsedSum -
        parsedSum / (1 + vatPercent / 100)
      ).toFixed(2);
      autoNote += ` у т.ч. ПДВ ${vatPercent}% = ${vatAmount
        .toFixed(2)
        .replace(".", ",")} грн.`;
    } else {
      autoNote += ` без ПДВ`;
    }

    const marker = "№";
    const hasMarker = purpose?.includes(marker);

    // всегда разбиваем по маркеру
    const [userPart, oldAutoNote] = hasMarker
      ? purpose.split(marker).map((s) => s.trim())
      : [purpose.trim(), ""];

    const currentAutoExists = oldAutoNote === autoNote;

    // если шаблон уже актуален — ничего не меняем
    if (currentAutoExists) return;

    const key = "purposeOfPayment";
    const updated = userPart
      ? `${userPart} ${marker} ${autoNote}`
      : `${marker} ${autoNote}`;
    setValue(key, updated);
  }, [accountNumber, date, accountSum, vatPercent, vatType, purpose, setValue]);
}
