import { useEffect } from "react";
import { useWatch, UseFormSetValue, Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { format } from "date-fns";

export function useAutoFillPaymentsPurpose(
  control: Control<FormValues>,
  setValue: UseFormSetValue<FormValues>
) {
  const accountNumber = useWatch({ control, name: "accountNumber" });
  const date = useWatch({ control, name: "date" });
  const vatType = useWatch({ control, name: "vatType" });
  const vatPercent = useWatch({ control, name: "vatPercent" });
  const mainPurpose = useWatch({ control, name: "purposeOfPayment" });
  const payments = useWatch({ control, name: "payments" });

  const formattedDate = date ? format(date, "dd.MM.yyyy") : "";

  useEffect(() => {
    if (!mainPurpose || !Array.isArray(payments) || payments.length === 0) return;

    const [userPart] = mainPurpose.split("№").map((s) => s.trim());

    if (!vatType || !vatPercent) {
      // без НДС
      payments.forEach((_, index) => {
        const autoPurpose = `${userPart} № ${accountNumber} від ${formattedDate}, без ПДВ`;
        setValue(`payments.${index}.purposeOfPayment`, autoPurpose as any);
      });
      return;
    }

    // С НДС — рассчитываем точные значения
    const rawVats = payments.map((p) => {
      const sum = Number(p.paySum) || 0;
      return sum - sum / (1 + vatPercent / 100);
    });

    const totalVat = rawVats.reduce((acc, v) => acc + v, 0);
    const totalVatRounded = +totalVat.toFixed(2);

    const roundedVats: number[] = [];
    let accumulatedRoundedVat = 0;

    payments.forEach((p, i) => {
      let roundedVat: number;

      if (i < payments.length - 1) {
        roundedVat = +rawVats[i].toFixed(2);
        accumulatedRoundedVat += roundedVat;
      } else {
        // Последний — компенсируем остаток
        roundedVat = +(totalVatRounded - accumulatedRoundedVat).toFixed(2);
      }

      const vatText = `у т.ч. ПДВ ${vatPercent}% = ${roundedVat.toFixed(2).replace(".", ",")} грн.`;
      const autoPurpose = `${userPart} № ${accountNumber} від ${formattedDate}, ${vatText}`;
      setValue(`payments.${i}.purposeOfPayment`, autoPurpose as any);
    });
  }, [mainPurpose, payments, vatType, vatPercent, accountNumber, date, setValue]);
}
