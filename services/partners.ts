import axiosInstance from "@/services/instance"
import { partners } from "@prisma/client"
import { partner_account_number } from "@prisma/client"


export type PartnersWithAccounts = partners & {
    partner_account_number: partner_account_number[];
  };


export const partnersService = async (id:number):Promise<PartnersWithAccounts[] | undefined> => {
        try {
            const { data } = await axiosInstance.get<PartnersWithAccounts[]>(`/partners/${id}/`)
            return data
        } catch (error) {
            console.log(error)
        }
    }
