# =====================================================================
#  Прод-сборка фронтенда «Блокадной карты».
#  Stage 1: ставим зависимости через yarn (проект использует yarn.lock,
#           поэтому npm ci здесь не подходит) и собираем статику Vite.
#  Stage 2: отдаём готовый dist лёгким static-сервером `serve`.
#  Caddy проксирует на этот контейнер всё, кроме /api и /auth.
# =====================================================================

# --- build stage -----------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# corepack включает yarn нужной версии без глобальной установки
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# В проде фронт ходит на относительные пути (/api, /auth) — единый origin
# с Caddy, поэтому CORS не нужен.
ENV VITE_API_URL="/"
RUN yarn build

# --- runtime stage ---------------------------------------------------
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 4173
# -s = режим SPA: любые маршруты отдаются через index.html (нужно для
# клиентского роутинга React Router: /map, /admin, /login и т.д.)
CMD ["serve", "-s", "dist", "-l", "4173"]
