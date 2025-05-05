// scripts/cronJob.ts
import cron from "node-cron";
import { rolloverAutoPayments } from "./rolloverAutoPayments";
import { updateBankInfo } from "@/scripts/updateBankInfo";
import prisma from "@/prisma/prisma-client";

const KYIV_TZ = "Europe/Kyiv";

console.log("⏰  Auto-payment cron started…");

cron.schedule(
  //"* * * * *",               // каждую минуту
  "0 3 * * *", // каждый день в 03:00
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

console.log("⏰  Bank info cron started…");

cron.schedule(
  "0 4 * * *",
  async () => {
    console.log(`[${new Date().toISOString()}] ➜ Bank update started`);
    try {
      await updateBankInfo();
      console.log(`[${new Date().toISOString()}] ✔ Bank update done`);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] ✖ Bank update failed`, e);
    } finally {
      await prisma.$disconnect();
    }
  },
  { timezone: KYIV_TZ }
);
