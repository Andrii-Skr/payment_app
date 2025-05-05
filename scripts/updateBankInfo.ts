/**
 * Обновляет таблицу `bank_info` актуальными данными НБУ.
 */

import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
if (!process.env.NBU_BANKS_URL) {
  console.error("✖  Не задана переменная окружения NBU_BANKS_URL");
  process.exit(1);
}
const NBU_BANKS_URL = process.env.NBU_BANKS_URL;

const normalizeMfo = (mfo: unknown) => String(mfo).padStart(6, "0");

export async function updateBankInfo() {
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


