# AGENTS.md  – bootstrap для pnpm offline

## Шаг 0. Настроить pnpm, если sandbox свежий

```bash
# Проверяем, скачан ли уже pnpm 10.11.1 в кэш Corepack.
if ! corepack which pnpm@10.11.1 >/dev/null 2>&1; then
  corepack enable                                # создаём shims
  corepack prepare pnpm@10.11.1 --activate       # качаем tar и активируем
fi
