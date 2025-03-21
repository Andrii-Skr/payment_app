import axiosInstance from "@/services/instance"
import { FormValues } from "@/components/shared/paymentForm";
import { documents } from "@prisma/client";



export const create = async (data:FormValues) => {
    try {
        await axiosInstance.post('/document/create', data)
    } catch (error) {
        console.log(error)
    }
}

export const update = async (data:FormValues) => {
    try {
        await axiosInstance.post('/document/update', data)
    } catch (error) {
        console.log(error)
    }
}

export const getByEntity = async (entity_id: number): Promise<documents[] | undefined> => {
    try {
        const { data } = await axiosInstance.get<documents[]>(`/document/entity/${entity_id}`)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const getById = async (doc_id:number):Promise<documents[] | undefined> => {
    try {
        const { data } = await axiosInstance.get<documents[]>(`/document/${doc_id}`)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const getByParentId = async (partner_id:number):Promise<documents[] | undefined> => {
    try {
        const { data } = await axiosInstance.get<documents[]>(`/entity/schedule/${partner_id}`)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const getAll = async ():Promise<documents[] | undefined> => {
    try {
        const { data } = await axiosInstance.get<documents[]>(`/document`)
        return data
    } catch (error) {
        console.log(error)
    }
}


