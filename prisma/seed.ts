import { role } from './../node_modules/.pnpm/@prisma+client@5.21.1_prisma@5.21.1/node_modules/.prisma/client/index.d';
import { entity } from '@prisma/client';
import { partners } from '@prisma/client';
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
}

async function addPartners() {
    await prisma.partners.createMany({
        data: [
            {
                name: "partner1Выбор",
                type: 1,
                edrpou: "12345678",
                entity_id: 1,

            },
            {
                name: "partner2Выбор",
                type: 1,
                edrpou: "22345678",
                entity_id: 1,

            },
            {
                name: "partner3Выбор",
                type: 1,
                edrpou: "52345678",
                entity_id: 1,

            },
            {
                name: "partner3Выбор",
                type: 1,
                edrpou: "62345678",
                entity_id: 1,

            },
            {
                name: "partner1Зенит",
                type: 2,
                edrpou: "32345678",
                entity_id: 2,

            },
            {
                name: "partner1Зенит",
                type: 2,
                edrpou: "42345678",
                entity_id: 2,

            }
        ]

    })

    await prisma.partner_account_number.createMany({
        data: [
            {
                partner_id: 1,
                bank_account: "12345678901234567890",
                mfo:"1234"
            },
            {
                partner_id: 1,
                bank_account: "22345678901234567890",
                mfo:"2234"
            },
            {
                partner_id: 2,
                bank_account: "32345678901234567890",
                mfo:"3234"
            }
        ]

    })

    await prisma.role.createMany({
        data: [
            {
                name: "admin"
            },

        ]

    })

    await prisma.user.createMany({
        data: [
            {
                login: "user1",
                password: "user1",
                role_id: 1,
                name: "user1",
            },

        ]

    })
}

async function clearData() {
    await prisma.$executeRaw`TRUNCATE TABLE "entity" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "partners" RESTART IDENTITY CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "partner_account_number" RESTART IDENTITY CASCADE;`
}

async function main() {
    try {
        await clearData()
        await addData()
        await addPartners()
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
