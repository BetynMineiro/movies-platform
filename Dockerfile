# syntax=docker/dockerfile:1

FROM node:20-alpine AS backend-builder
WORKDIR /app/backend/movie-api
COPY backend/movie-api/package*.json ./
RUN npm ci --legacy-peer-deps
COPY backend/movie-api/ ./
RUN npm run build

FROM node:20-alpine AS backend-prod-deps
WORKDIR /app/backend/movie-api
COPY backend/movie-api/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend/movie-app
COPY frontend/movie-app/package*.json ./
RUN npm ci
COPY frontend/movie-app/ ./
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_PORT=3000
ENV FRONTEND_PORT=3001
ENV JWT_SECRET=undefined-secret-key

COPY --from=backend-builder /app/backend/movie-api/dist ./backend/movie-api/dist
COPY --from=backend-builder /app/backend/movie-api/package*.json ./backend/movie-api/
COPY --from=backend-prod-deps /app/backend/movie-api/node_modules ./backend/movie-api/node_modules
COPY --from=backend-builder /app/backend/movie-api/src/seed/data/seed-data.json ./backend/movie-api/src/seed/data/seed-data.json
COPY --from=backend-builder /app/backend/movie-api/src/seed/data/seed-data.json ./backend/movie-api/dist/seed/data/seed-data.json

COPY --from=frontend-builder /app/frontend/movie-app/.next ./frontend/movie-app/.next
COPY --from=frontend-builder /app/frontend/movie-app/public ./frontend/movie-app/public
COPY --from=frontend-builder /app/frontend/movie-app/next.config.ts ./frontend/movie-app/next.config.ts
COPY --from=frontend-builder /app/frontend/movie-app/package*.json ./frontend/movie-app/
COPY --from=frontend-builder /app/frontend/movie-app/node_modules ./frontend/movie-app/node_modules

COPY scripts/start-demo.sh ./scripts/start-demo.sh

EXPOSE 3000 3001

CMD ["sh", "/app/scripts/start-demo.sh"]
