/**
 * Обновляет таблицу `bank_info` актуальными данными НБУ.
 * Запускать из корня проекта командой `pnpm ts-node scripts/updateBankInfo.ts`
 */

import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
if (!process.env.NBU_BANKS_URL) {
  console.error("✖  Не задана переменная окружения NBU_BANKS_URL");
  process.exit(1);
}
console.log(process.env.NBU_BANKS_URL);
const NBU_BANKS_URL = process.env.NBU_BANKS_URL;

const normalizeMfo = (mfo: unknown) => String(mfo).padStart(6, "0");

async function main() {
  const { data } = await axios.get(NBU_BANKS_URL, { timeout: 15_000 });

  const ops = (data as Array<Record<string, unknown>>).map((item) =>
    prisma.bank_info.upsert({
      where: { mfo: normalizeMfo(item.mfo) },
      update: { bank_name: String(item.txt ?? "") },
      create: {
        mfo: normalizeMfo(item.mfo),
        bank_name: String(item.txt ?? ""),
      },
    })
  );

  await prisma.$transaction(ops);

  console.info(
    `✔  Обновлено / добавлено ${ops.length} банковских записей в bank_info`
  );
}

main()
  .catch((err) => {
    console.error("✖  Ошибка обновления bank_info", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
