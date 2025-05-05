"use strict";
/**
 * Обновляет таблицу `bank_info` актуальными данными НБУ.
 * Запускать из корня проекта командой `pnpm ts-node scripts/updateBankInfo.ts`
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
if (!process.env.NBU_BANKS_URL) {
    console.error("✖  Не задана переменная окружения NBU_BANKS_URL");
    process.exit(1);
}
console.log(process.env.NBU_BANKS_URL);
const NBU_BANKS_URL = process.env.NBU_BANKS_URL;
const normalizeMfo = (mfo) => String(mfo).padStart(6, "0");
async function main() {
    const { data } = await axios_1.default.get(NBU_BANKS_URL, { timeout: 15000 });
    const ops = data.map((item) => prisma.bank_info.upsert({
        where: { mfo: normalizeMfo(item.mfo) },
        update: { bank_name: String(item.txt ?? "") },
        create: {
            mfo: normalizeMfo(item.mfo),
            bank_name: String(item.txt ?? ""),
        },
    }));
    await prisma.$transaction(ops);
    console.info(`✔  Обновлено / добавлено ${ops.length} банковских записей в bank_info`);
}
main()
    .catch((err) => {
    console.error("✖  Ошибка обновления bank_info", err);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
