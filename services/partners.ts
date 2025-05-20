import { PartnerValues } from "@/components/payment-form/addPartner";
import axiosInstance from "@/services/instance";

import type { partners, partner_account_number } from "@prisma/client";

export type PartnersWithAccounts = partners & {
  partner_account_number: partner_account_number[];
};

/* Получить всех партнёров по entity_id */
export const partnersService = async (
  entityId: number
): Promise<PartnersWithAccounts[] | null> => {
  try {
    const { data } = await axiosInstance.get<PartnersWithAccounts[]>(
      `/partners/${entityId}`
    );
    return data;
  } catch (error) {
    console.error("Ошибка при загрузке партнёров:", error);
    return null;
  }
};

/* Получить партнёра по edrpou и entity_id */
export const getByEdrpou = async (
  edrpou: string,
  entityId: number
): Promise<PartnersWithAccounts | null> => {
  try {
    const { data } = await axiosInstance.get<{
      found: boolean;
      partner: PartnersWithAccounts;
    }>(`/partners/check-edrpou`, {
      params: { edrpou, entity_id: entityId },
    });

    return data.found ? data.partner : null;
  } catch (error) {
    console.error("Ошибка при проверке ЕДРПОУ:", error);
    return null;
  }
};

/* Создать контрагента */
export const createPartner = async (data: PartnerValues) => {
  try {
    const res = await axiosInstance.post("/partners", data);
    return res.data.partner;
  } catch (error) {
    console.error("Ошибка при создании партнёра:", error);
    throw error;
  }
};

/* Обновить имя контрагента */
export const updatePartner = async (
  id: number,
  data: Pick<PartnerValues, "full_name" | "short_name">
) => {
  try {
    await axiosInstance.patch(`/partners/${id}`, data);
  } catch (error) {
    console.error("Ошибка при обновлении партнёра:", error);
  }
};

/* Добавить банковский счёт */
export const addBankAccount = async (data: {
  partner_id: number;
  bank_account: string;
  mfo?: string;
  bank_name?: string;
  is_default?: boolean;
}) => {
  try {
    await axiosInstance.post("/partners/account", data);
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 409) {
      throw new Error("Такой счёт уже существует у этого контрагента.");
    }

    console.error("Ошибка при добавлении счёта:", error);
    throw new Error(message || "Ошибка при добавлении счёта.");
  }
};

/* Сделать счёт основным */
export const setDefaultAccount = async (id: number) => {
  try {
    await axiosInstance.patch("/partners/account/default", { id });
  } catch (error) {
    console.error("Ошибка при назначении счёта основным:", error);
  }
};

/* Удалить счёт (is_deleted = true) */
export const deleteAccount = async (id: number) => {
  try {
    await axiosInstance.patch("/partners/account/delete", { id });
  } catch (error) {
    console.error("Ошибка при удалении счёта:", error);
  }
};
