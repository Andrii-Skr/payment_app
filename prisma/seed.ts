import { entity } from '@prisma/client';
import prisma from "./prisma-client"
// import {hashSync} from "bcrypt"

async function addData() {

    await prisma.entity.createMany({
        data: [
            {
                name: "Выбор",
                type: 1,
                edrpou: "12345678",
            },
            {
                name: "Зенит",
                type: 1,
                edrpou: "22345678",
            }
        ]

    })

    await prisma.partners.createMany({
        data: [
            {
                name: "partner1Выбор",
                type: 1,
                edrpou: "12345678",
                entity_id: 1,
                mfo: "12345678"
            },
            {
                name: "partner2Выбор",
                type: 1,
                edrpou: "22345678",
                entity_id: 1,
                mfo: "22345678"
            },
            {
                name: "partner3Выбор",
                type: 1,
                edrpou: "52345678",
                entity_id: 1,
                mfo: "52345678"
            },
            {
                name: "partner3Выбор",
                type: 1,
                edrpou: "62345678",
                entity_id: 1,
                mfo: "62345678"
            },
            {
                name: "partner1Зенит",
                type: 2,
                edrpou: "32345678",
                entity_id: 2,
                mfo: "32345678"
            },
            {
                name: "partner1Зенит",
                type: 2,
                edrpou: "42345678",
                entity_id: 2,
                mfo: "42345678"
            }
        ]

    })

    await prisma.partner_account_number.createMany({
        data: [
            {
                partner_id: 1,
                account_number: "12345678901234567890",
            },
            {
                partner_id: 1,
                account_number: "22345678901234567890",
            },
            {
                partner_id: 2,
                account_number: "12345678901234567890",
            }
        ]

    })
}

async function clearData() {
    await prisma.$executeRaw`TRUNCATE TABLE "entity" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "partners" RESTART IDENTITY CASCADE;`
}

async function main() {
    try {
        await clearData()
        await addData()
    } catch (error) {
        console.log(error)
    }

}

main()
    .then(async () => {
        await prisma.$disconnect()
})
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
})
