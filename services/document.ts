import axiosInstance from "@/services/instance";
import { FormValues } from "@/types/formTypes";
import { documents, template } from "@prisma/client";
import { DocumentWithPartner } from "@/app/api/document/entity/[entity_id]/route";

export const create = async (data: FormValues) => {
  try {
    await axiosInstance.post("/document/create", data);
  } catch (error) {
    console.log(error);
  }
};

type TemplateData = Omit<FormValues, "payments">;

export const createTemplate = async (data: TemplateData) => {
  try {
    await axiosInstance.post("/document/create/template", data);
  } catch (error) {
    console.log(error);
  }
};

export const getTemplateById = async (
  entity_id: number
): Promise<template[]> => {
  try {
    const { data } = await axiosInstance.get<template[]>(
      `/document/get/template/${entity_id}`
    );
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const update = async (data: FormValues) => {
  try {
    await axiosInstance.post("/document/update", data);
  } catch (error) {
    console.log(error);
  }
};

export const getByEntity = async (
  entity_id: number
): Promise<DocumentWithPartner[]> => {
  try {
    const { data } = await axiosInstance.get<DocumentWithPartner[]>(
      `/document/entity/${entity_id}`
    );
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getById = async (
  doc_id: number
): Promise<documents[] | undefined> => {
  try {
    const { data } = await axiosInstance.get<documents[]>(
      `/document/${doc_id}`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getByParentId = async (
  partner_id: number
): Promise<documents[] | undefined> => {
  try {
    const { data } = await axiosInstance.get<documents[]>(
      `/entity/schedule/${partner_id}`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAll = async (): Promise<documents[] | undefined> => {
  try {
    const { data } = await axiosInstance.get<documents[]>(`/document`);
    return data;
  } catch (error) {
    console.log(error);
  }
};
