import axiosInstance from "@/services/instance";
import { FormValues } from "@/types/formTypes";
import { TemplateWithBankDetails } from "@api/templates/[id]/route";

export const getTemplateById = async (
  id: number
): Promise<TemplateWithBankDetails[]> => {
  try {
    const { data } = await axiosInstance.get<TemplateWithBankDetails[]>(
      `/templates/${id}`
    );
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

type TemplateData = Omit<FormValues, "payments">;

type TemplateResponse = {
  success: boolean;
  message: string; // ← «Template created…» или «Template updated…»
};

export const createTemplate = async (data: TemplateData) => {
  try {
    const { data: res } = await axiosInstance.post<TemplateResponse>(
      "/templates",
      data
    );
    return { success: res.success, message: res.message };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      "Ошибка при создании/обновлении шаблона";
    return { success: false, message };
  }
};
