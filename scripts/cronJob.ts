// scripts/cronJob.ts
import cron from "node-cron";
import { rolloverAutoPayments } from "./rolloverAutoPayments";

const KYIV_TZ = "Europe/Kyiv";

console.log("⏰  Auto-payment cron started…");

cron.schedule(
  //"* * * * *",               // каждую минуту
   "0 3 * * *",               // каждый день в 03:00
  async () => {
    console.log(`[${new Date().toISOString()}] ➜ Rollover started`);
    try {
      await rolloverAutoPayments();
      console.log(`[${new Date().toISOString()}] ✔ Rollover done`);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] ✖ Rollover failed`, e);
    }
  },
  { timezone: KYIV_TZ }
);
