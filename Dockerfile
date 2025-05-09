# Dockerfile (корень репозитория)
# ────────────────────────────
# 1. Базовый слой: зависимости
FROM node:22.15.0-bookworm AS deps
WORKDIR /app

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile      # devDeps нужны для сборки

COPY . .

ARG DATABASE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ARG NBU_BANKS_URL

ENV DATABASE_URL=$DATABASE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXTAUTH_URL=$NEXTAUTH_URL \
    NBU_BANKS_URL=$NBU_BANKS_URL

# ────────────────────────────
# 2. Сборка скриптов (cron-target)
FROM deps AS scripts
RUN pnpm prisma:generate
RUN pnpm build:scripts                 # tsc -p tsconfig.scripts.json
RUN pnpm prune --prod                  # удаляем dev-зависимости

# ────────────────────────────
# 3. Сборка Next.js (app-target)
FROM deps AS app-builder
RUN pnpm prisma:generate
RUN pnpm build:web                     # next build
RUN pnpm build:scripts
RUN pnpm prune --prod

# ────────────────────────────
# 4. Финальный образ для веб-приложения
FROM node:22.15.0-bookworm AS app
WORKDIR /app
ENV NODE_ENV=production PORT=3000
RUN npm i -g pnpm
COPY --from=app-builder /app ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
CMD ["pnpm","start"]

# ────────────────────────────
# 5. Финальный образ для cron-процессов
FROM node:22.15.0-slim AS cron
WORKDIR /app
ENV NODE_ENV=production
RUN npm i -g pnpm
COPY --from=scripts /app ./
CMD ["node","dist/scripts/cronJob.js"]
