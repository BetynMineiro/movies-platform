#!/bin/sh
set -eu

BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-3001}"
JWT_SECRET="${JWT_SECRET:-undefined-secret-key}"

export PORT="$BACKEND_PORT"
export JWT_SECRET

cd /app/backend/movie-api
node dist/main &
BACK_PID=$!

cd /app/frontend/movie-app
./node_modules/.bin/next start -H 0.0.0.0 -p "$FRONTEND_PORT" &
FRONT_PID=$!

cleanup() {
  kill "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

while kill -0 "$BACK_PID" 2>/dev/null && kill -0 "$FRONT_PID" 2>/dev/null; do
  sleep 1
done

cleanup
wait "$BACK_PID" 2>/dev/null || true
wait "$FRONT_PID" 2>/dev/null || true
