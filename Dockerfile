# Dockerfile (корень репозитория)
# ───────────────────────────────
# 1. Базовый слой с зависимостями
FROM node:22.15.0-bookworm AS deps
WORKDIR /app

RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2. Сборка приложения и cron-скриптов
FROM deps AS builder
COPY . .

# переменные, которые могут понадобиться во время build
ARG DATABASE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ARG NBU_BANKS_URL

ENV DATABASE_URL=$DATABASE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXTAUTH_URL=$NEXTAUTH_URL \
    NBU_BANKS_URL=$NBU_BANKS_URL

RUN pnpm prisma:generate \
 && pnpm build:web \
 && pnpm build:scripts \
 && pnpm prune --prod               

# 3. Финальный рантайм-образ
FROM node:22.15.0-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

RUN npm i -g pnpm
COPY --from=builder /app ./

EXPOSE 3000
