import {
  BankInfoWithIncludes,
  BankInfoWithIncludesNullable,
} from "@/app/api/(v1)/(protected)/bank-info/[id]/route";
import axiosInstance from "@/services/instance";

export const bankInfoById = async (
  id: string
): Promise<BankInfoWithIncludesNullable> => {
  try {
    const { data } = await axiosInstance.get<BankInfoWithIncludes>(
      `/bank-info/${id}/`
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
