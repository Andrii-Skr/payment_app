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

async function clearData() {
    await prisma.$executeRaw`TRUNCATE TABLE "entity" RESTART IDENTITY CASCADE;`
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
