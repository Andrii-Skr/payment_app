import cron from "node-cron";
import cronLogger from "../lib/logs/cron-logger";
import { pruneApiRequestLog } from "../lib/logs/pruneApiRequestLog";
import prisma from "../prisma/prisma-client";
import { rolloverAutoPayments } from "./rolloverAutoPayments";

const KYIV_TZ = "Europe/Kyiv";
const isTestMode = process.env.TEST_MODE === "true";

// ⏰ Расписания
const ROLLOVER_SCHEDULE = isTestMode ? "* * * * *" : "0 3 * * *";
const API_REQUEST_LOG_PRUNE_SCHEDULE = isTestMode ? "* * * * *" : "15 3 * * *";
const _BANK_UPDATE_SCHEDULE = isTestMode ? "* * * * *" : "0 4 * * *";

cronLogger.info({ msg: `⏰ Cron service started in ${isTestMode ? "TEST" : "PROD"} mode`, tag: "init" });

/** 🔁 Автопролонгация */
cron.schedule(
  ROLLOVER_SCHEDULE,
  async () => {
    const startedAt = Date.now();
    cronLogger.info({ msg: "➜ Rollover started", tag: "rollover" });

    try {
      await rolloverAutoPayments();
      const duration = Date.now() - startedAt;
      cronLogger.info({ msg: `✔ Rollover done (${duration}ms)`, tag: "rollover" });
    } catch (e) {
      cronLogger.error({ msg: "✖ Rollover failed", error: e, tag: "rollover" });
    }
  },
  { timezone: KYIV_TZ },
);

/** 🧹 Очистка API-логов старше года */
cron.schedule(
  API_REQUEST_LOG_PRUNE_SCHEDULE,
  async () => {
    const startedAt = Date.now();
    cronLogger.info({ msg: "➜ API request log prune started", tag: "api_request_log_prune" });

    try {
      const { count, deletedBefore } = await pruneApiRequestLog();
      const duration = Date.now() - startedAt;
      cronLogger.info({
        msg: `✔ API request log prune done (${duration}ms)`,
        tag: "api_request_log_prune",
        deletedCount: count,
        deletedBefore: deletedBefore?.toISOString() ?? null,
      });
    } catch (e) {
      cronLogger.error({ msg: "✖ API request log prune failed", error: e, tag: "api_request_log_prune" });
    }
  },
  { timezone: KYIV_TZ },
);

/** 🏦 Обновление банков */
// cron.schedule(
//   BANK_UPDATE_SCHEDULE,
//   async () => {
//     const startedAt = Date.now();
//     cronLogger.info({ msg: "➜ Bank update started", tag: "bank_update" });

//     try {
//       await updateBankInfo();
//       const duration = Date.now() - startedAt;
//       cronLogger.info({ msg: `✔ Bank update done (${duration}ms)`, tag: "bank_update" });
//     } catch (e) {
//       cronLogger.error({ msg: "✖ Bank update failed", error: e, tag: "bank_update" });
//     } finally {
//       await prisma.$disconnect();
//     }
//   },
//   { timezone: KYIV_TZ }
// );

// Удержание процесса
setInterval(() => {}, 1000 * 60 * 60);

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    cronLogger.info({ msg: `🔻 Shutting down cron (${signal})`, tag: "cron" });
    await prisma.$disconnect();
    process.exit(0);
  });
});
