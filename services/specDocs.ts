import axiosInstance from "@/services/instance";

export const updatePaymentsById = async (id: { specDocIds: number[] }) => {
  try {
    const { data } = await axiosInstance.post(`spec-docs`, id);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const unpay = async (id: number) => {
  try {
    const { data } = await axiosInstance.patch("/spec-docs/unpay", { id });
    return data;
  } catch (error) {
    console.log(error);
  }
};
