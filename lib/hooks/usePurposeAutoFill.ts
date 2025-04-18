import { useEffect } from "react";
import {
  useWatch,
  UseFormSetValue,
  Control,
  FieldValues,
  Path,
} from "react-hook-form";
import { format } from "date-fns";

export function usePurposeAutoFill<T extends FieldValues>(
  control: Control<T>,
  setValue: UseFormSetValue<T>
) {
  const accountNumber = useWatch({ control, name: "accountNumber" as Path<T> }) as string;
  const date = useWatch({ control, name: "date" as Path<T> }) as Date | null;
  const accountSum = useWatch({ control, name: "accountSum" as Path<T> }) as string;
  const vatPercent = useWatch({ control, name: "vatPercent" as Path<T> }) as number;
  const vatType = useWatch({ control, name: "vatType" as Path<T> }) as boolean;
  const purpose = useWatch({ control, name: "purposeOfPayment" as Path<T> }) as string;

  useEffect(() => {
    if (!accountNumber || !date || !accountSum || vatType === undefined) return;

    const parsedSum = parseFloat(accountSum.toString());
    const formattedDate = format(new Date(date), "dd.MM.yyyy");

    let autoNote = `№ ${accountNumber} від ${formattedDate}, на суму ${parsedSum.toFixed(2)},`;
    if (vatType === true && vatPercent != null) {
      const vatAmount = +(parsedSum - parsedSum / (1 + vatPercent / 100)).toFixed(2);
      autoNote += ` в т.ч. ПДВ ${vatAmount.toFixed(2)}`;
    } else {
      autoNote += ` без ПДВ`;
    }

    const marker = "—";
    const hasMarker = purpose?.includes(marker);

    // всегда разбиваем по маркеру
    const [userPart, oldAutoNote] = hasMarker
      ? purpose.split(marker).map((s) => s.trim())
      : [purpose.trim(), ""];

    const currentAutoExists = oldAutoNote === autoNote;

    // если шаблон уже актуален — ничего не меняем
    if (currentAutoExists) return;

    const key = "purposeOfPayment" as Path<T>;
    const updated = userPart ? `${userPart} ${marker} ${autoNote}` : `${marker} ${autoNote}`;
    setValue(key, updated as unknown as T[typeof key]);
  }, [accountNumber, date, accountSum, vatPercent, vatType, purpose, setValue]);
}
