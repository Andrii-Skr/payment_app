import { PartnerValues } from "@/components/payment-form/addPartner";
import axiosInstance from "@/services/instance";

import type {
  partners,
  partner_account_number,
} from "@prisma/client";

export type PartnerAccountWithEntities = partner_account_number & {
  entities: {
    entity_id: number;
    partner_account_number_id: number;
    is_default: boolean;
    is_visible: boolean;
    is_deleted: boolean;
  }[];
  is_default: boolean;
  is_visible: boolean;
  is_deleted: boolean;
};

export type PartnersWithAccounts = partners & {
  partner_account_number: PartnerAccountWithEntities[];
  entities: {
    entity_id: number;
    partner_id: number;
    is_visible: boolean;
    is_deleted: boolean;
  }[];
};

export type CreatePartnerResponse = {
  partner: PartnersWithAccounts;
  reused: boolean;
};

const mergeAccountRelation = (
  acc: PartnerAccountWithEntities,
  entityId: number,
): PartnerAccountWithEntities => {
  const rel = acc.entities.find((e) => e.entity_id === entityId);
  return {
    ...acc,
    is_default: rel?.is_default ?? false,
    is_visible: rel?.is_visible ?? true,
    is_deleted: rel?.is_deleted ?? false,
  } as PartnerAccountWithEntities;
};

/* Получить всех партнёров по entity_id */
export const partnersService = async (
  entityId: number,
  options: { showDeleted?: boolean; showHidden?: boolean } = {}
): Promise<PartnersWithAccounts[] | null> => {
  try {
    const params = new URLSearchParams();
    if (options.showDeleted) params.append("showDeleted", "true");
    if (options.showHidden) params.append("showHidden", "true");

    const url = `/partners/${entityId}?${params.toString()}`;
    const { data } = await axiosInstance.get<PartnersWithAccounts[]>(url);

    return data.map((p) => ({
      ...p,
      partner_account_number: p.partner_account_number
        .filter((a) => a.entities.length > 0)
        .map((a) => mergeAccountRelation(a, entityId)),
    }));
  } catch (error) {
    console.error("Ошибка при загрузке партнёров:", error);
    return null;
  }
};

export const togglePartnerVisibility = async (
  partner_id: number,
  is_visible: boolean,
  entity_id: number
) => {
  try {
    await axiosInstance.patch("/partners/visibility", {
      partner_id,
      entity_id,
      is_visible,
    });
  } catch (error) {
    console.error("Ошибка при смене видимости партнёра:", error);
    throw error;
  }
};

export const getPartnerVisibility = async (
  partner_id: number,
  entity_id: number
) => {
  try {
    const response = await axiosInstance.get("/partners/visibility", {
      params: { partner_id, entity_id },
    });

    return response.data as { is_visible: boolean };
  } catch (error) {
    console.error("Ошибка при получении видимости партнёра:", error);
    throw error;
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

    if (!data.found) return null;

    const partner = data.partner;
    return {
      ...partner,
      partner_account_number: partner.partner_account_number
        .filter((a) => a.entities.length > 0)
        .map((a) => mergeAccountRelation(a, entityId)),
    };
  } catch (error) {
    console.error("Ошибка при проверке ЕДРПОУ:", error);
    return null;
  }
};

/* Создать контрагента */
export const createPartner = async (
  data: PartnerValues,
): Promise<CreatePartnerResponse> => {
  try {
    const res = await axiosInstance.post("/partners", data);
    return res.data as CreatePartnerResponse;
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

export const deletePartner = async (
  partner_id: number,
  is_deleted: boolean,
  entity_id: number
) => {
  try {
    await axiosInstance.patch("/partners/delete", {
      partner_id,
      entity_id,
      is_deleted,
    });
  } catch (error) {
    console.error("Ошибка при удалении партнёра:", error);
    throw error;
  }
};

/* Добавить банковский счёт */
export const addBankAccount = async (data: {
  partner_id: number;
  entity_id: number;
  bank_account: string;
  mfo?: string;
  bank_name?: string;
  is_default?: boolean;
}) => {
  try {
    const res = await axiosInstance.post("/partners/account", data);
    return res.data.created;
  } catch (error: any) {
    console.error("Ошибка при добавлении счёта:", error);
    throw new Error("Не удалось добавить счёт.");
  }
};

/* Сделать счёт основным */
export const setDefaultAccount = async (
  partner_account_number_id: number,
  entity_id: number,
  is_default: boolean,
) => {
  try {
    await axiosInstance.patch("/partners/account/default", {
      partner_account_number_id,
      entity_id,
      is_default,
    });
  } catch (error) {
    console.error("Ошибка при назначении счёта основным:", error);
  }
};

/* Удалить счёт (is_deleted = true) */
export const deleteAccount = async (id: number, is_deleted: boolean) => {
  try {
    await axiosInstance.patch("/partners/account/delete", { id, is_deleted });
  } catch (error) {
    console.error("Ошибка при удалении счёта:", error);
  }
};
