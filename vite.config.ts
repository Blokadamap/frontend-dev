import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Адрес локального backend-api. Можно переопределить переменной BACKEND_URL.
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // В dev фронт ходит на относительные пути (/api, /auth), а Vite проксирует
  // их на локальный backend-api — так браузер работает в одном origin и нет CORS.
  //
  // ВАЖНО: ключи — регулярные выражения с обязательным слешем после сегмента
  // ('^/auth/'), иначе строковый префикс '/auth' перехватывал бы и фронтовый
  // роут '/authors', ломая прямой переход по ссылке.
  server: {
    proxy: {
      '^/api/': BACKEND,
      '^/auth/': BACKEND,
    },
  },
})
