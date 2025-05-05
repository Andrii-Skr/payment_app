import { NextResponse, after } from "next/server"
import type { NextRequest }   from "next/server"
import logger from "@/lib/logs/api-logger"

/**
 * Извлекаем IP из стандартных прокси-заголовков.
 *   • nginx  ⇒ proxy_set_header X-Real-IP $remote_addr;
 *   • nginx  ⇒ proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 *   • Docker ⇒ выполняется тот же трюк ingress'ом
 */
function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for")
  if (fwd) return fwd.split(",")[0].trim()

  const real = req.headers.get("x-real-ip")
  if (real) return real

  return "unknown"
}

export function middleware(req: NextRequest) {
  const t0 = performance.now()
  const res = NextResponse.next()

  after(() => {
    logger.info({
      method: req.method,
      url:    req.nextUrl.pathname + req.nextUrl.search,
      status: res.status,   // Edge-middleware всегда 200
      ms:     Math.round(performance.now() - t0),
      ip:     getClientIp(req),
    })
  })

  return res
}

/** Ловим ТОЛЬКО API-маршруты */
export const config = { matcher: ["/api/:path*"] }
