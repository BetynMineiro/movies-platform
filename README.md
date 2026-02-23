# Movies Platform Assessment

This repository is a technical assessment project.

It represents a movie platform focused on organizing and exploring movie titles, cast members, and ratings.

## Business Goal

Centralize movie-related information in one place to support:

- Fast discovery of movies, actors, and ratings.
- Clear relationships between movies and cast members.
- Ongoing catalog maintenance through content updates.

## Functional Scope

The platform covers three core domains:

- Movies
- Actors
- Movie Ratings

It also includes search and relationship-based navigation, such as:

- Movies an actor has appeared in.
- Actors in a specific movie.

## Product Principles

- Prioritize data consistency and reliability.
- Ensure stable behavior and graceful error handling.
- Keep the project structure clear for future evolution.

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

From repository root:

```bash
npm --prefix backend/movie-api ci --legacy-peer-deps
npm --prefix frontend/movie-app ci
```

### Run backend and frontend locally

Backend (NestJS on `3000`):

```bash
cd backend/movie-api
npm run start:dev
```

Frontend (Next.js on `3001`):

```bash
cd frontend/movie-app
npm run dev
```

Local URLs:

- Backend API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Frontend: http://localhost:3001

Frontend uses `NEXT_PUBLIC_API_BASE_URL` when defined; otherwise it defaults to `http://localhost:3000`.

### Run tests

Backend unit tests:

```bash
cd backend/movie-api
npm run test
```

Backend e2e tests:

```bash
cd backend/movie-api
npm run test:e2e
```

Frontend tests:

```bash
cd frontend/movie-app
npm run test
```

## Docker Demo Environment

This repository includes a single Docker image that runs:

- Backend (NestJS) on port 3000
- Frontend (Next.js) on port 3001
- SQLite in the same container (for assessment/demo simplicity)

### Quick Start (Recommended)

From the repository root:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up -d --build
```

Stop everything:

```bash
docker compose down
```

### Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

Endpoints:

- Backend API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Frontend: http://localhost:3001

### Note about `start-demo.sh`

The file `scripts/start-demo.sh` exists to start and manage **both services in one container**:

- Starts backend (`node dist/main`)
- Starts frontend (`next start`)
- Handles signal/cleanup so both processes stop correctly

Where it is used:

- `Dockerfile` uses this script as the container `CMD`
- `docker compose up` and `docker run` trigger it automatically

You usually do **not** run it manually; it is an internal entrypoint for the demo container.

### Run with Docker only

```bash
docker build -t movies-platform:local .
docker run --rm -p 3000:3000 -p 3001:3001 movies-platform:local
```

## CI with GitHub Actions

Workflow file: `.github/workflows/ci.yml`

On push/pull request it runs:

1. Backend install, build, unit tests, e2e tests
2. Frontend install, lint, build
3. Docker image build
4. Container smoke test (`/health`)
