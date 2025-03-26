import axiosInstance from "@/services/instance";
import { PaymentValues } from "@/components/shared/paymentForm";

export const create = async (data: PaymentValues) => {
  try {
    await axiosInstance.post("/document/create/auto", data);
  } catch (error) {
    console.log(error);
  }
};

export const get = async () => {
  try {
    await axiosInstance.get("/regular/get");
  } catch (error) {
    console.log(error);
  }
};
