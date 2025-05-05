"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/cronJob.ts
const node_cron_1 = __importDefault(require("node-cron"));
const rolloverAutoPayments_1 = require("./rolloverAutoPayments");
const KYIV_TZ = "Europe/Kyiv";
console.log("⏰  Auto-payment cron started…");
node_cron_1.default.schedule(
//"* * * * *",               // каждую минуту
"0 3 * * *", // каждый день в 03:00
async () => {
    console.log(`[${new Date().toISOString()}] ➜ Rollover started`);
    try {
        await (0, rolloverAutoPayments_1.rolloverAutoPayments)();
        console.log(`[${new Date().toISOString()}] ✔ Rollover done`);
    }
    catch (e) {
        console.error(`[${new Date().toISOString()}] ✖ Rollover failed`, e);
    }
}, { timezone: KYIV_TZ });
