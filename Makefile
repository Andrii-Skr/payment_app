# ───── Настройки ─────
COMPOSE = docker compose

# ───── СБОРКА ─────
.PHONY: build rebuild clean down
build:                         ## Первый билд (runtime-слой app)
	$(COMPOSE) build app

rebuild:                       ## Полный ребилд без кэша
	$(COMPOSE) build --no-cache app

clean:                         ## Остановка + удаление томов
	$(COMPOSE) down -v --remove-orphans

down:                          ## Только остановка и удаление контейнеров
	$(COMPOSE) down --remove-orphans

# ───── ЗАПУСК ─────
.PHONY: up up-app run-all run-all-build run-all-fg stop restart \
        logs cron-logs logs-all shell cron-shell
up:                            ## Поднять app + cron (без билда)
	$(COMPOSE) up -d app cron

up-app:                        ## Поднять только веб-часть
	$(COMPOSE) up -d app

run-all:                       ## Первый запуск с автоматической сборкой
	$(COMPOSE) up -d --build app cron

run-all-build:                 ## Принудительный билд + запуск
	$(COMPOSE) up -d --build app cron

run-all-fg:                    ## Запуск в foreground
	$(COMPOSE) up app cron

stop:                          ## Пауза без удаления контейнеров
	$(COMPOSE) stop

restart:                       ## Быстрый рестарт (без ребилда)
	$(COMPOSE) restart app cron

logs:                          ## Логи веб-сервиса
	$(COMPOSE) logs -f app

cron-logs:                     ## Логи cron-процесса
	$(COMPOSE) logs -f cron

logs-all:                      ## Общие логи
	$(COMPOSE) logs -f app cron

shell:                         ## Оболочка в app
	$(COMPOSE) exec app /bin/sh

cron-shell:                    ## Оболочка в cron
	$(COMPOSE) exec cron /bin/sh

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
