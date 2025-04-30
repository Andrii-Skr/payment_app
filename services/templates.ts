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

export const createTemplate = async (data: TemplateData) => {
  try {
    await axiosInstance.post("/templates", data);
  } catch (error) {
    console.log(error);
  }
};
