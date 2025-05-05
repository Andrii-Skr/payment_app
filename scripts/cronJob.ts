import cron from "node-cron";
import { rolloverAutoPayments } from "./rolloverAutoPayments";
import { updateBankInfo } from "./updateBankInfo";
import prisma from "../prisma/prisma-client";
import cronLogger from "../lib/logs/cron-logger";

const KYIV_TZ = "Europe/Kyiv";

cronLogger.info({ msg: "⏰ Cron jobs started", tag: "cron" });

cron.schedule(
  "0 3 * * *",
  async () => {
    cronLogger.info({ msg: "➜ Rollover started", tag: "rollover" });
    try {
      await rolloverAutoPayments();
      cronLogger.info({ msg: "✔ Rollover done", tag: "rollover" });
    } catch (e) {
      cronLogger.error({ msg: "✖ Rollover failed", error: e, tag: "rollover" });
    }
  },
  { timezone: KYIV_TZ }
);

cronLogger.info({ msg: "⏰ Bank info cron scheduled", tag: "bank_update" });

cron.schedule(
  "0 4 * * *",
  async () => {
    cronLogger.info({ msg: "➜ Bank update started", tag: "bank_update" });
    try {
      await updateBankInfo();
      cronLogger.info({ msg: "✔ Bank update done", tag: "bank_update" });
    } catch (e) {
      cronLogger.error({ msg: "✖ Bank update failed", error: e, tag: "bank_update" });
    } finally {
      await prisma.$disconnect();
    }
  },
  { timezone: KYIV_TZ }
);
