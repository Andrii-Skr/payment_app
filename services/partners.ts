import { PartnerValues } from "@/components/payment-form/addPartner";
import axiosInstance from "@/services/instance";
import { partners } from "@prisma/client";
import { partner_account_number } from "@prisma/client";

export type PartnersWithAccounts = partners & {
  partner_account_number: partner_account_number[];
};

export const partnersService = async (
  id: number
): Promise<PartnersWithAccounts[] | null> => {
  try {
    const { data } = await axiosInstance.get<PartnersWithAccounts[] | null>(
      `/partners/${id}/`
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getByEdrpou = async (
  edrpou: string,
  id: number
): Promise<partners | null> => {
  try {
    const { data } = await axiosInstance.get<partners | null>(
      `/partners/check-edrpou`,
      { params: { edrpou, id } }
    );

    return data;
  } catch (error) {
    console.log("Ошибка при проверке ЕДРПОУ:", error);
    return null;
  }
};

export const createPartner = async (data: PartnerValues) => {
  console.log("data", data);
  try {
    await axiosInstance.post("/partners", data);
  } catch (error) {
    console.log(error);
  }
};
