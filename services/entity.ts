import axiosInstance from "@/services/instance"
import { entity } from "@prisma/client"


export const entityService = async ():Promise<entity[] | undefined> => {
        try {
            const { data } = await axiosInstance.get<entity[]>('/entity')
            return data
        } catch (error) {
            console.log(error)
        }
    }

    export const entitySchedule = async () => {
        try {
            const { data } = await axiosInstance.get(`/entity/schedule`)
            return data
        } catch (error) {
            console.log(error)
        }
    }
