# Push 0 — Dockerized PostgreSQL for Sandbox/Dev/Prod (Infrastructure‑First, No Schema)

**Objective**  
Stand up a reliable, repeatable **PostgreSQL environment** in Docker with local admin UI, healthchecks, and backup/restore tooling. **No application schema** or migrations in this push. This enables later pushes to focus on UI/UX while having a solid DB runtime.

---

## Scope & Non‑Goals

**In scope**

- Docker Compose stack with **PostgreSQL 16** and **Adminer** (admin UI).
- Init script that creates **three databases** in a single Postgres instance: `sandbox`, `dev`, `prod`.
- Healthcheck, persistent storage, timezone, and environment management.
- Makefile for `up/down/logs/psql/backup/restore/shell` convenience.
- README section documenting usage.

**Out of scope**

- No tables or application schema (DDL).
- No API/server.
- No authentication for Adminer (it exposes DB creds from `.env`, only for local use).

---

## Repository Changes (file/dir layout)

Create the following structure at the repo root:

```
.
├─ docker/
│  ├─ compose.yml
│  ├─ .env.example
│  └─ initdb/
│     └─ 01-create-dbs.sql
├─ backups/             # will be created automatically by compose/Makefile
├─ Makefile
├─ README.md            # will be amended with a “Push 0” section
└─ .gitignore           # ensure sensitive/ephemeral files are ignored
```

**Add to `.gitignore` (append if it exists):**

```
# Push 0 (Docker Postgres)
docker/.env
docker/pgdata/
backups/
```

> `docker/pgdata/` is the default mount path only if you switch to a bind‑mount; by default we use a **named volume** (`pgdata`) which Docker manages. Keeping the ignore line is harmless.

---

## File Contents (copy exactly)

### 1) `docker/compose.yml`

```yaml
version: "3.9"

name: cortex-db

services:
  postgres:
    image: postgres:16
    container_name: cortex-postgres
    env_file:
      - ./docker/.env
    environment:
      - TZ=${TZ:-UTC}
      # Optional: tune Postgres here if needed
      # - POSTGRES_INITDB_ARGS=--encoding=UTF8 --locale=C
    ports:
      - "${PG_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/initdb:/docker-entrypoint-initdb.d:ro
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped
    networks:
      - cortex-net

  adminer:
    image: adminer:4
    container_name: cortex-adminer
    environment:
      - ADMINER_DEFAULT_SERVER=postgres
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - cortex-net
    profiles: ["sandbox"] # only starts when --profile sandbox is used

volumes:
  pgdata: {}

networks:
  cortex-net: {}
```

> **Profiles**: `adminer` runs only with `--profile sandbox`. The `postgres` service always runs.

---

### 2) `docker/.env.example`

```
# Docker Postgres environment (copy to docker/.env)
POSTGRES_USER=cortex
POSTGRES_PASSWORD=change_me
POSTGRES_DB=postgres
PG_PORT=5432
TZ=UTC
```

> **Security note**: Choose a strong `POSTGRES_PASSWORD` when you copy to `docker/.env`. Do **not** commit `docker/.env`.

---

### 3) `docker/initdb/01-create-dbs.sql`

```sql
-- Runs only on first initialization (empty PGDATA). Creates logical DBs.
-- Owner will be POSTGRES_USER (superuser) by default; adjust later if needed.

CREATE DATABASE sandbox;
CREATE DATABASE dev;
CREATE DATABASE prod;
```

> This does **not** define any schema. It only creates three empty databases in the same instance.

---

### 4) `Makefile`

```makefile
SHELL := /bin/bash
COMPOSE := docker compose
ENV_FILE := docker/.env
CONTAINER := cortex-postgres

# Default database when not specified: dev
DB ?= dev
# File to restore (path under ./backups or a filename in that dir)
FILE ?=

.PHONY: db:up db:up-sandbox db:down db:logs db:psql db:shell db:backup db:restore help

help:
\t@echo 'Targets:'
\t@echo '  make db:up           - Start Postgres (no Adminer)'
\t@echo '  make db:up-sandbox   - Start Postgres + Adminer (profile sandbox)'
\t@echo '  make db:down         - Stop stack'
\t@echo '  make db:logs         - Tail Postgres logs'
\t@echo '  make db:psql DB=dev  - Open psql shell into DB (sandbox|dev|prod)'
\t@echo '  make db:shell        - Shell into the Postgres container'
\t@echo '  make db:backup DB=dev- Dump DB to backups/DB-YYYYMMDD-HHMM.sql'
\t@echo '  make db:restore FILE=<backups/..sql> DB=dev - Restore dump into DB'

db:up:
\t@[ -f $(ENV_FILE) ] || (echo 'Missing $(ENV_FILE). Copy docker/.env.example to docker/.env and edit.' && exit 1)
\t$(COMPOSE) --env-file $(ENV_FILE) up -d postgres

db:up-sandbox:
\t@[ -f $(ENV_FILE) ] || (echo 'Missing $(ENV_FILE). Copy docker/.env.example to docker/.env and edit.' && exit 1)
\t$(COMPOSE) --env-file $(ENV_FILE) --profile sandbox up -d

db:down:
\t$(COMPOSE) down

db:logs:
\t$(COMPOSE) logs -f postgres

db:psql:
\t@echo "Opening psql into '$(DB)' ..."
\t@docker exec -it $(CONTAINER) psql -U $$POSTGRES_USER -d $(DB)

db:shell:
\t@docker exec -it $(CONTAINER) bash

db:backup:
\t@[ -d backups ] || mkdir -p backups
\t@DATE=$$(date +%Y%m%d-%H%M%S); \\\n\
\tdocker exec $(CONTAINER) sh -c \"pg_dump -U $$POSTGRES_USER -d $(DB) -f /backups/$(DB)-$${DATE}.sql\"; \\\n\
\tls -lh backups | tail -n +1

db:restore:
\t@if [ -z "$(FILE)" ]; then echo "Usage: make db:restore FILE=backups/<file.sql> [DB=dev]"; exit 1; fi
\t@BASENAME=$$(basename -- "$(FILE)"); \\\n\
\tif [ ! -f "backups/$$BASENAME" ]; then echo "File backups/$$BASENAME not found."; exit 1; fi; \\\n\
\techo "Restoring $$BASENAME into $(DB) ..."; \\\n\
\tdocker exec -i $(CONTAINER) psql -U $$POSTGRES_USER -d $(DB) -f /backups/$$BASENAME; \\\n\
\techo "Restore complete."
```

---

## Usage Instructions

1. **Create env file**

   ```bash
   cp docker/.env.example docker/.env
   # Edit docker/.env and set a strong POSTGRES_PASSWORD
   ```

2. **Start Postgres (no Adminer)**

   ```bash
   make db:up
   ```

3. **(Optional) Start with Adminer UI (sandbox profile)**

   ```bash
   make db:up-sandbox     # then open http://localhost:8080
   # Server: postgres, User: from docker/.env, Password: from docker/.env, Database: dev (or sandbox/prod)
   ```

4. **Connect via psql**

   ```bash
   make db:psql DB=sandbox   # or DB=dev / DB=prod
   ```

5. **Back up a database**

   ```bash
   make db:backup DB=dev
   ls backups/
   ```

6. **Restore a backup**

   ```bash
   make db:restore FILE=backups/dev-YYYYMMDD-HHMM.sql DB=dev
   ```

7. **Stop the stack**
   ```bash
   make db:down
   ```

> The `initdb` script runs **only on first startup** of a fresh data volume and creates the three DBs. Subsequent restarts will not re‑run it.

---

## Acceptance Criteria (QA Checklist)

- [ ] `make db:up` runs without error; `cortex-postgres` is **healthy**.
- [ ] `make db:psql DB=sandbox` connects; `\l` lists `sandbox`, `dev`, `prod`.
- [ ] `make db:backup DB=dev` creates `backups/dev-YYYYMMDD-HHMM.sql` with a non‑zero size.
- [ ] `make db:restore FILE=backups/dev-YYYYMMDD-HHMM.sql DB=dev` completes successfully.
- [ ] `make db:up-sandbox` exposes **Adminer** at `http://localhost:8080` and allows login.
- [ ] Container restarts do not lose data (volumes persist).

**Optional smoke test** (manual; this is not “schema” work)  
From `psql` in `sandbox` DB:

```sql
CREATE TABLE scratch(x int);
INSERT INTO scratch VALUES (1);
SELECT * FROM scratch;
DROP TABLE scratch;
```

Everything should work; table is not part of the app schema—just a QA probe.

---

## Troubleshooting

- **`Missing docker/.env`**: Run `cp docker/.env.example docker/.env` and set a password.
- **Port 5432 in use**: Change `PG_PORT` in `docker/.env` (e.g., `5433`) and rerun `make db:up`.
- **Init script didn’t run**: It only runs on a new data volume. `make db:down && docker volume rm cortex-db_pgdata && make db:up` to re‑init (will erase data).
- **Adminer cannot connect**: Ensure you started with `make db:up-sandbox` and used proper creds; wait for healthcheck to turn healthy.

---

## Security & Ops Notes

- This stack is for **local development**. Do not expose Adminer publicly.
- Keep `docker/.env` out of version control. Rotate `POSTGRES_PASSWORD` if leaked.
- Backups live under `./backups`. Do not commit them. Consider adding OS‑level encryption if stored outside the repo.

---

## README Addition (suggested text)

Append to your `README.md`:

```md
## Push 0 — Local PostgreSQL (Docker)

### Quickstart

1. `cp docker/.env.example docker/.env` (set a strong `POSTGRES_PASSWORD`)
2. `make db:up` (or `make db:up-sandbox` for Adminer at http://localhost:8080)
3. `make db:psql DB=dev` to open a psql shell

### Backups

- `make db:backup DB=dev` → dumps to `backups/`
- `make db:restore FILE=backups/dev-YYYYmmdd-HHMM.sql DB=dev`

### Notes

- Three databases are created on first run: `sandbox`, `dev`, `prod`.
- No application schema yet—this is infra only.
```

---

## Multi‑Agent Orchestrator Prompt (for Claude Code)

> Use this prompt as‑is. It will coordinate multiple agents to implement Push 0 with minimal thinking.

```text
You are the coordinator for **Project Cortex — Push 0 (Docker PostgreSQL)**. Spawn specialized Claude Code agents (Infra, DevEx, Docs, QA) and execute the plan exactly as specified below.

Branch: `push/00-postgres`

Constraints:
- Infrastructure first. **Do NOT** add any app schema or migrations.
- Use Docker Compose v3.9, Postgres 16, Adminer (sandbox profile only).
- Paths and file contents must match this document exactly.

=== Plan ===

1) Create files and directories per the “Repository Changes” and “File Contents” sections of this document:
   - `docker/compose.yml` (exact YAML provided)
   - `docker/.env.example` (exact text)
   - `docker/initdb/01-create-dbs.sql` (exact SQL)
   - `Makefile` (exact content)
   - Append `.gitignore` entries as shown
   - Create empty `backups/` directory
2) Add the “README Addition (suggested text)” to `README.md` under a new “Push 0” section.
3) Open a branch `push/00-postgres`, commit changes with message: `push(0): dockerized postgres + adminer, makefile, backups`.

=== Roles ===

- **Infra Agent**
  - Create Docker files and directories.
  - Verify healthcheck and profiles work (`adminer` only when `--profile sandbox`).
- **DevEx Agent**
  - Implement Makefile targets (`db:up`, `db:up-sandbox`, `db:down`, `db:logs`, `db:psql`, `db:shell`, `db:backup`, `db:restore`).
  - Ensure cross-platform compatibility (bash assumed; WSL/macOS ok).
- **Docs Agent**
  - Update `README.md` with quickstart, backup/restore, and notes.
- **QA Agent**
  - Run the Acceptance Criteria checklist end-to-end.
  - Provide terminal output snippets/screenshots in the PR description.

=== Commands to run (QA) ===

- `cp docker/.env.example docker/.env && sed -i.bak 's/change_me/<STRONG_PASSWORD>/g' docker/.env`
- `make db:up`
- `docker ps` (confirm `cortex-postgres` healthy)
- `make db:psql DB=sandbox -c "\\l"` (list DBs)
- `make db:backup DB=dev && ls -lh backups`
- `make db:up-sandbox` and open http://localhost:8080 (login via env creds)
- `make db:down`

=== Deliverables ===

- Branch `push/00-postgres` with the files in place.
- PR with description:
  - How to run (`db:up`, `db:up-sandbox`)
  - Acceptance checklist with results
  - Known issues / troubleshooting notes

Execute this plan now and stop when the PR is open with passing checks.
```

---

## Appendix — Cheat Sheet

- Bring up Postgres:
  ```bash
  make db:up
  ```
- Bring up Postgres + Adminer:
  ```bash
  make db:up-sandbox
  ```
- psql into `dev`:
  ```bash
  make db:psql DB=dev
  ```
- Backup `dev`:
  ```bash
  make db:backup DB=dev
  ```
- Restore into `dev`:
  ```bash
  make db:restore FILE=backups/dev-YYYYMMDD-HHMM.sql DB=dev
  ```
- Tail logs:
  ```bash
  make db:logs
  ```

> Next steps (later pushes): add UI shell, local Dexie store, then introduce schema & sync when the UI feels right.
