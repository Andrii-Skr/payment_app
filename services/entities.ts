import type { entity } from "@prisma/client";
import axiosInstance from "@/services/instance";
import type { InfoFormValues, Row } from "@/types/infoTypes";

export const getAll = async (withDeleted = false): Promise<entity[] | []> => {
  try {
    const query = withDeleted ? "?withDeleted=true" : "";
    const { data } = await axiosInstance.get<entity[]>(`/entities${query}`);
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getById = async (id: number): Promise<entity | null> => {
  try {
    const { data } = await axiosInstance.get<entity>(`/entities/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const create = async (data: InfoFormValues) => {
  try {
    await axiosInstance.post("/entities", data);
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 409) {
      throw new Error("Юрлицо с таким ЕДРПОУ уже есть.");
    }

    console.error("Ошибка при добавлении:", error);
    throw new Error(message || "Ошибка при добавлении");
  }
};

export const update = async (data: Partial<Row>) => {
  try {
    await axiosInstance.patch(`/entities`, data);
  } catch (error) {
    console.log(error);
  }
};
export const remove = async (id: number, data: boolean) => {
  try {
    await axiosInstance.patch(`/entities/${id}`, { is_deleted: data });
  } catch (error) {
    console.log(error);
  }
};

export const reorder = async (order: { id: number; sort_order: number }[]): Promise<void> => {
  try {
    await axiosInstance.patch("/entities/reorder", { order });
  } catch (error) {
    console.error("Ошибка при сохранении порядка:", error);
  }
};
