import axiosInstance from "@/services/instance";
import { PaymentValues } from "@/types/formTypes";
import { AutoPaymentWithDocs } from "@api/regular-payments/route";

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
