"use client";
import { useEffect, useState } from "react";
import { useMfoFromIban } from "@/lib/hooks/useMfoFromIban";
import { apiClient } from "@/services/api-client";

export function useAutoFillBankDetails(iban?: string) {
  const { mfo, error } = useMfoFromIban(iban);
  const [bankName, setBankName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mfo && !error) {
      setLoading(true);
      apiClient.bankInfo
        .bankInfoById(mfo)
        .then((data) => {
          if (!data) return;
          setBankName(data.bank_name || "");
        })
        .catch(() => setBankName(""))
        .finally(() => setLoading(false));
    } else {
      setBankName("");
    }
  }, [mfo, error]);

  return { mfo, bankName, error, loading };
}
