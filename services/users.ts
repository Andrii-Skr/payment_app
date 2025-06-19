import axiosInstance from "@/services/instance";
import type { user, role } from "@prisma/client";

export const getAll = async (): Promise<user[] | []> => {
  try {
    const { data } = await axiosInstance.get<user[]>("/users");
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

export const updateLinks = async (
  user_id: number,
  data: {
    add_entities?: number[];
    remove_entities?: number[];
    add_partners?: number[];
    remove_partners?: number[];
  },
) => {
  try {
    await axiosInstance.post("/users", { user_id, ...data });
  } catch (error) {
    console.error(error);
  }
};

export const toggleDelete = async (user_id: number, is_deleted: boolean) => {
  try {
    await axiosInstance.patch("/users/delete", { user_id, is_deleted });
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
  add_partners?: number[];
  remove_partners?: number[];
}) => {
  try {
    await axiosInstance.post("/users", data);
  } catch (error) {
    console.error(error);
  }
};

export type Role = { id: number; name: string };

