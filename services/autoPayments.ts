import type { AutoPaymentWithDocs } from "@api/regular-payments/route";
import axiosInstance from "@/services/instance";
import type { PaymentValues } from "@/types/formTypes";

export const create = async (data: PaymentValues) => {
  try {
    await axiosInstance.post("/regular-payments", data);
  } catch (error) {
    console.log(error);
  }
};

export const get = async (): Promise<AutoPaymentWithDocs[] | undefined> => {
  try {
    const { data } = await axiosInstance.get("/regular-payments");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteById = async (id: number) => {
  try {
    await axiosInstance.patch("/regular-payments/delete", { id });
  } catch (error) {
    console.log(error);
  }
};

export const updatePurpose = async (docId: number) => {
  try {
    await axiosInstance.patch("/regular-payments", { doc_id: docId });
  } catch (error) {
    console.log(error);
  }
};
