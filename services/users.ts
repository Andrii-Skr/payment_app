import axiosInstance from "@/services/instance";
import type { user } from "@prisma/client";

export const getAll = async (): Promise<user[] | []> => {
  try {
    const { data } = await axiosInstance.get<user[]>("/users");
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const updateRole = async (user_id: number, role_id: number) => {
  try {
    await axiosInstance.patch("/users/role", { user_id, role_id });
  } catch (error) {
    console.error(error);
  }
};

export const updateEntities = async (
  user_id: number,
  entity_ids: number[],
) => {
  try {
    await axiosInstance.patch("/users/entities", { user_id, entity_ids });
  } catch (error) {
    console.error(error);
  }
};

export const updatePartners = async (
  user_id: number,
  partner_ids: number[],
) => {
  try {
    await axiosInstance.patch("/users/partners", { user_id, partner_ids });
  } catch (error) {
    console.error(error);
  }
};

