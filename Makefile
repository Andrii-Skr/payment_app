# ───── Настройки ─────
COMPOSE = docker compose

# ───── СБОРКА ─────
.PHONY: build rebuild clean
build:
	$(COMPOSE) build          # первый build

rebuild:
	$(COMPOSE) build --no-cache

clean:
	$(COMPOSE) down -v --remove-orphans

# ───── ЗАПУСК ─────
.PHONY: up run-all run-all-build run-all-fg stop restart logs cron-logs logs-all shell cron-shell
up:
	$(COMPOSE) up -d          # без сборки

run-all:            ## Сборка образа при первом запуске, далее просто up
	$(COMPOSE) up -d app cron

run-all-build:      ## Принудительно билд + up (на случай изменений)
	$(COMPOSE) up --build -d app cron

run-all-fg:         ## Запуск в foreground (без rebuild)
	$(COMPOSE) up app cron

stop:
	$(COMPOSE) stop

restart:            ## Быстрый перезапуск без rebuild
	$(COMPOSE) restart app cron

logs:
	$(COMPOSE) logs -f app

cron-logs:
	$(COMPOSE) logs -f cron

logs-all:
	$(COMPOSE) logs -f app cron

shell:
	$(COMPOSE) exec app sh

cron-shell:
	$(COMPOSE) exec cron sh

# ───── PRISMA ─────
.PHONY: db-generate db-push db-migrate db-seed studio
db-generate:
	$(COMPOSE) exec app pnpm prisma:generate

db-push:
	$(COMPOSE) exec app pnpm prisma:push

db-migrate:
	$(COMPOSE) exec app pnpm prisma:migrate

db-seed:
	$(COMPOSE) exec app pnpm prisma:seed

studio:
	$(COMPOSE) exec app pnpm prisma:studio
