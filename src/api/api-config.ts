// PROD — берём адрес из VITE_API_URL.
// DEV — относительный путь ("" ), запросы идут на dev-сервер Vite и
// проксируются на локальный backend (см. server.proxy в vite.config.ts).
// Можно переопределить, задав VITE_API_URL в .env.local.
export const BASE_API_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.VITE_API_URL ?? "")
