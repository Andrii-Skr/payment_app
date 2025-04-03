import axiosInstance from "@/services/instance";
import { PaymentValues } from "@/components/shared/paymentForm";
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
