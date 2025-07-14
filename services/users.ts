import axiosInstance from "@/services/instance";
import type { role } from "@prisma/client";
import type { UserWithRelations } from "@api/users/route";

export const getAll = async (withDeleted = false): Promise<UserWithRelations[] | []> => {
  try {
    const query = withDeleted ? "?withDeleted=true" : "";
    const { data } = await axiosInstance.get<UserWithRelations[]>(`/users${query}`);
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const updateRole = async (
  user_id: number,
  role_id: number,
  login?: string,
  name?: string,
) => {
  try {
    await axiosInstance.patch("/users", { user_id, role_id, login, name });
  } catch (error) {
    console.error(error);
  }
};

export const getRoles = async (): Promise<role[] | []> => {
  try {
    const { data } = await axiosInstance.get<role[]>("/roles");
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const remove = async (user_id: number, is_deleted: boolean) => {
  try {
    await axiosInstance.patch("/users/delete", { user_id, is_deleted });
  } catch (error) {
    console.error(error);
  }
};

export const updateUser = async (
  user_id: number,
  data: { login: string; name: string; role_id: number },
) => {
  try {
    await axiosInstance.patch("/users/update", { user_id, ...data });
  } catch (error) {
    console.error(error);
  }
};

export const updateRights = async (data: {
  user_id: number;
  add_entities?: number[];
  remove_entities?: number[];
  add_partners?: { partner_id: number; entity_id: number }[];
  remove_partners?: { partner_id: number; entity_id: number }[];
}) => {
  try {
    await axiosInstance.post("/users", data);
  } catch (error) {
    console.error(error);
  }
};

export type Role = { id: number; name: string };

