import { TemplateBody } from "@/app/api/(v1)/(protected)/templates/route";
import axiosInstance from "@/services/instance";
import { FormValues } from "@/types/formTypes";
import { TemplateWithBankDetails } from "@api/templates/[id]/route";

export type GetTemplatesOptions ={
  showDeleted?: boolean;
  showHidden?: boolean;
}

export type TemplatePayload ={
  id?: number;
  entity_id?: number;
  sample: string;

  partner_id: number;
  full_name: string;
  short_name: string;
  edrpou: string;

  accountNumber: string;
  accountSum: string;
  accountSumExpression: string;

  vatType: boolean;
  vatPercent: number;

  date: string  | null;
  partner_account_number_id: number;

  purposeOfPayment?: string;
  note?: string;
}
export type TemplateResponse ={
  success: boolean;
  message: string;
  sample?: TemplateWithBankDetails; // сервер отдаёт sample
}

export const getById = async (
  entityId: number,
  options: GetTemplatesOptions = {}
) => {
  const params = new URLSearchParams();
  if (options.showDeleted) params.append("showDeleted", "true");
  if (options.showHidden) params.append("showHidden", "true");

  const url =
    `/templates/${entityId}` + (params.size ? `?${params.toString()}` : "");

  const { data } = await axiosInstance.get<TemplateWithBankDetails[]>(url);
  return data;
};

export async function update(
  id: number,
  payload: Omit<TemplatePayload, "id">
): Promise<Omit<TemplateResponse, "sample">> {
  try {
    const { data } = await axiosInstance.patch<TemplateResponse>(
      `/templates/${id}`,
      payload
    );
    return { success: data.success, message: data.message };
  } catch (err: any) {
    const message =
      err?.response?.data?.message ?? "Ошибка при обновлении шаблона";
    return { success: false, message };
  }
}


export async function save(
  payload: TemplatePayload
): Promise<Omit<TemplateResponse, "sample">> {
  try {
    const { data } = await axiosInstance.post<TemplateResponse>(
      "/templates",
      payload
    );
    return { success: data.success, message: data.message };
  } catch (err: any) {
    const message =
      err?.response?.data?.message ??
      "Ошибка при создании/обновлении шаблона";
    return { success: false, message };
  }
}

export const toggleVisibility = async (
  template_id: number,
  is_visible: boolean
) => {
  try {
    await axiosInstance.patch("/templates/visibility", {
      template_id,
      is_visible,
    });
  } catch (error) {
    console.error("toggleTemplateVisibility error", error);
    throw error;
  }
};

export const toggleDelete = async (
  template_id: number,
  is_deleted: boolean
) => {
  try {
    await axiosInstance.patch("/templates/delete", {
      template_id,
      is_deleted,
    });
  } catch (error) {
    console.error("toggleTemplateDelete error", error);
    throw error;
  }
};
