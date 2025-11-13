Project-Cortex

## Push 0 — Local PostgreSQL (Docker)

### Quickstart
1. `cp docker/.env.example docker/.env` (set a strong `POSTGRES_PASSWORD`)
2. `make db-up` (or `make db-up-sandbox` for Adminer at http://localhost:8080)
3. `make db-psql DB=dev` to open a psql shell

### Backups
- `make db-backup DB=dev` → dumps to `backups/`
- `make db-restore FILE=backups/dev-YYYYmmdd-HHMM.sql DB=dev`

### Notes
- Three databases are created on first run: `sandbox`, `dev`, `prod`.
- No application schema yet—this is infra only.