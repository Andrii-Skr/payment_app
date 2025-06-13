import { useEffect } from "react";
import { useWatch, UseFormSetValue, Control } from "react-hook-form";
import { FormValues } from "@/types/formTypes";
import { AUTO_PURPOSE_MARKER } from "@/constants/marker";
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
  const isAuto = useWatch({ control, name: "is_auto_purpose_of_payment" });

  const formattedDate = date ? format(date, "dd.MM.yyyy") : "";

  useEffect(() => {
    if (!mainPurpose || !Array.isArray(payments) || payments.length === 0) return;

    const [userPart] = mainPurpose.split(AUTO_PURPOSE_MARKER).map((s) => s.trim());

    if (!isAuto) {
      const manualPurposes = payments.map(() => userPart);
      const isSameManual = payments.every((p, i) => p.purposeOfPayment === manualPurposes[i]);

      if (!isSameManual) {
        payments.forEach((_, i) => {
          setValue(`payments.${i}.purposeOfPayment`, manualPurposes[i] as any);
        });
      }
      return;
    }

    const newPurposes: string[] = [];

    if (!vatType || !vatPercent) {
      newPurposes.push(
        ...payments.map(
          () => `${userPart} ${AUTO_PURPOSE_MARKER} ${accountNumber} від ${formattedDate}, без ПДВ`
        )
      );
    } else {
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
          roundedVat = +(totalVatRounded - accumulatedRoundedVat).toFixed(2);
        }

        const vatText = `у т.ч. ПДВ ${vatPercent}% = ${roundedVat
          .toFixed(2)
          .replace(".", ",")} грн.`;
        newPurposes.push(
          `${userPart} ${AUTO_PURPOSE_MARKER} ${accountNumber} від ${formattedDate}, ${vatText}`
        );
      });
    }

    const isSame = payments.every((p, i) => p.purposeOfPayment === newPurposes[i]);

    if (!isSame) {
      payments.forEach((_, i) => {
        setValue(`payments.${i}.purposeOfPayment`, newPurposes[i] as any);
      });
    }
  }, [
    mainPurpose,
    JSON.stringify(payments),
    vatType,
    vatPercent,
    accountNumber,
    date,
    isAuto,
  ]);
}
