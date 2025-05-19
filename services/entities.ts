import axiosInstance from "@/services/instance";
import { InfoFormValues, Row } from "@/types/infoTypes";
import { entity } from "@prisma/client";

export const getAll = async (): Promise<entity[] | []> => {
  try {
    const { data } = await axiosInstance.get<entity[]>("/entities");
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
  } catch (error) {
    console.log(error);
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
