import axiosInstance from "@/services/instance";
import { FormValues } from "@/types/formTypes";
import { documents } from "@prisma/client";
import { DocumentWithPartner } from "@/prisma/data/documents";
import {
  DocumentWithIncludes,
  DocumentWithIncludesNullable,
} from "@api/documents/[id]/route";
import { EntityWithAll } from "@api/documents/entities/route";

export type CreateDocumentPayload = Omit<FormValues, "date"> & { date: string };

export const create = async (data: CreateDocumentPayload) => {
  try {
    await axiosInstance.post("/documents", data);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const update = async (data: CreateDocumentPayload) => {
  try {
    await axiosInstance.patch("/documents/update", data);
  } catch (error) {
    console.log(error);
  }
};

export const getAll = async (): Promise<documents[] | undefined> => {
  try {
    const { data } = await axiosInstance.get<documents[]>(`/documents`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const remove = async (id: number) => {
  try {
    await axiosInstance.patch("/documents/delete", { id });
  } catch (error) {
    console.log(error);
  }
};

export const getById = async (
  id: number
): Promise<DocumentWithIncludesNullable> => {
  try {
    const { data } = await axiosInstance.get<DocumentWithIncludes>(
      `/documents/${id}`
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const entitySchedule = async (): Promise<EntityWithAll[] | null> => {
  try {
    const { data } = await axiosInstance.get<EntityWithAll[]>(
      `/documents/entities`
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//------------
export const getByEntity = async (
  id: number
): Promise<DocumentWithPartner[]> => {
  try {
    const { data } = await axiosInstance.get<DocumentWithPartner[]>(
      `/documents/payments-list`,
      { params: { id } }
    );
    return data;
  } catch (error) {
    console.error("getByEntity error:", error);
    return [];
  }
};
