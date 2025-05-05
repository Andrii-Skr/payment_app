import pino from "pino"

let logger: pino.Logger

const isNode =
  typeof process === "object" &&
  process.release?.name === "node" &&
  typeof require === "function"

if (isNode) {
  const fs = require("node:fs")
  const path = require("node:path")

  const LOG_DIR = path.join(process.cwd(), "logs")
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })

  const date = new Date().toISOString().slice(0, 10)
  const dest = path.join(LOG_DIR, `api-${date}.log`)

  logger = pino(
    { level: "info" },
    pino.transport({
      targets: [
        { target: "pino/file", options: { destination: dest }, level: "info" },
        {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
          level: "debug",
        },
      ],
    })
  )
} else {
  // В Edge / браузере — глушим
  logger = {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
    fatal: () => {},
    trace: () => {},
    child: () => logger,
  } as unknown as pino.Logger
}

export default logger
