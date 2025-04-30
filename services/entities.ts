
import axiosInstance from "@/services/instance";
import { documents, entity } from "@prisma/client";

// export const getByParentId = async (
//   partner_id: number
// ): Promise<documents[] | undefined> => {
//   try {
//     const { data } = await axiosInstance.get<documents[]>(
//       `/entity/schedule/${partner_id}`
//     );
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };

export const entityService = async (): Promise<entity[] | null> => {
  try {
    const { data } = await axiosInstance.get<entity[]>("/entities");
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};



export const getEntityById = async (
  id: number
): Promise<entity | null> => {
  try {
    const { data } = await axiosInstance.get<entity>(
      `/entities/${id}`
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
