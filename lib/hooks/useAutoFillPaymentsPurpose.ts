import { useEffect } from "react";
import { useWatch, UseFormSetValue, Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { format } from "date-fns";

export function useAutoFillPaymentsPurpose(
  control: Control<FormValues>,
  setValue: UseFormSetValue<FormValues>
) {
  const accountNumber = useWatch({
    control,
    name: "accountNumber",
  });
  const date = useWatch({
    control,
    name: "date",
  });
  const vatType = useWatch({ control, name: "vatType" });
  const vatPercent = useWatch({ control, name: "vatPercent" });
  const mainPurpose = useWatch({ control, name: "purposeOfPayment" });
  const payments = useWatch({ control, name: "payments" });

  const formattedDate = date ? format(date, "dd.MM.yyyy") : "";

  useEffect(() => {
    if (!mainPurpose || !Array.isArray(payments)) return;

    const [userPart] = mainPurpose.split("№").map((s) => s.trim());

    payments.forEach((payment, index) => {
      const sum = Number(payment.paySum) || 0;

      const vatText =
        vatType && vatPercent
          ? `у т.ч. ПДВ ${vatPercent}% = ${(sum - sum / (1 + vatPercent / 100))
              .toFixed(2)
              .replace(".", ",")} грн.`
          : "без ПДВ";

      const autoPurpose = `${userPart} № ${accountNumber} від ${formattedDate}, ${vatText}`;

      if (payment.purposeOfPayment !== autoPurpose) {
        setValue(`payments.${index}.purposeOfPayment`, autoPurpose as any);
      }
    });
  }, [
    mainPurpose,
    payments,
    vatType,
    vatPercent,
    accountNumber,
    date,
    setValue,
  ]);
}
