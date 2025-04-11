import axiosInstance from "@/services/instance";
import { PaymentValues } from "@/types/formTypes";
import { AutoPaymentWithDocs } from "@/app/api/regular/get/route";

export const create = async (data: PaymentValues) => {
  try {
    await axiosInstance.post("/document/create/auto", data);
  } catch (error) {
    console.log(error);
  }
};

export const get = async (): Promise<AutoPaymentWithDocs[] | undefined> => {
  try {
    const { data } = await axiosInstance.get("/regular/get");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const cancel = async (id: number) => {
  try {
    await axiosInstance.patch("/regular/cancel", { id });
  } catch (error) {
    console.log(error);
  }
};
