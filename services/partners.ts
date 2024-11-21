import axiosInstance from "@/services/instance"
import { partners } from "@prisma/client"


export const partnersService = async (id:number):Promise<partners[] | undefined> => {
        try {
            const { data } = await axiosInstance.get<partners[]>(`/partners/${id}/`)
            return data
        } catch (error) {
            console.log(error)
        }
    }
