import fs from "node:fs";
import path from "node:path";
import pino from "pino";

const LOG_DIR = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const dest = path.join(LOG_DIR, `cron-${date}.log`);

const cronLogger = pino(
  { level: "info" },
  pino.transport({
    targets: [
      {
        target: "pino/file",
        options: { destination: dest },
        level: "info",
      },
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
        level: "debug",
      },
    ],
  })
);

export default cronLogger;
