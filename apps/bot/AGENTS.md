# Bot — local agent facts

Workspace: `@platform/bot`, grammY long-polling Telegram bot; has no HTTP port, no route registry, no web secrets. Bot is **disabled by default** and exits cleanly; enabling requires `BOT_ENABLED=true` and `BOT_TOKEN` in an untracked env file.

Example command: `/start`. No Telegram Mini App auth or persistent users are implemented here.

Graceful stop uses `bot.stop()`; stdout Pino logging, optional pino-roll. Do not log bot tokens or update payloads. Read root `docs/ARCHITECTURE.md` for platform rules.
