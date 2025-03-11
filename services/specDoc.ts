
import axiosInstance from "@/services/instance"


export const updatePaymentsById = async (spec_id:{ specDocIds: number[] }) => {
    try {
        const { data } = await axiosInstance.post(`/entity/schedule/spec`,spec_id)
        return data
    } catch (error) {
        console.log(error)
    }
}
