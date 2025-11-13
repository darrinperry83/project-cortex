SHELL := /bin/bash
COMPOSE := docker compose -f docker/compose.yml
ENV_FILE := docker/.env
CONTAINER := cortex-postgres

# Default database when not specified: dev
DB ?= dev
# File to restore (path under ./backups or a filename in that dir)
FILE ?=

help:
	@echo 'Targets:'
	@echo '  make db:up           - Start Postgres (no Adminer)'
	@echo '  make db:up-sandbox   - Start Postgres + Adminer (profile sandbox)'
	@echo '  make db:down         - Stop stack'
	@echo '  make db:logs         - Tail Postgres logs'
	@echo '  make db:psql DB=dev  - Open psql shell into DB (sandbox|dev|prod)'
	@echo '  make db:shell        - Shell into the Postgres container'
	@echo '  make db:backup DB=dev- Dump DB to backups/DB-YYYYMMDD-HHMM.sql'
	@echo '  make db:restore FILE=<backups/..sql> DB=dev - Restore dump into DB'

db:up:
	@[ -f $(ENV_FILE) ] || (echo 'Missing $(ENV_FILE). Copy docker/.env.example to docker/.env and edit.' && exit 1)
	$(COMPOSE) --env-file $(ENV_FILE) up -d postgres

db:up-sandbox:
	@[ -f $(ENV_FILE) ] || (echo 'Missing $(ENV_FILE). Copy docker/.env.example to docker/.env and edit.' && exit 1)
	$(COMPOSE) --env-file $(ENV_FILE) --profile sandbox up -d

db:down:
	$(COMPOSE) down

db:logs:
	$(COMPOSE) logs -f postgres

db:psql:
	@echo "Opening psql into '$(DB)' ..."
	@docker exec -it $(CONTAINER) psql -U $$POSTGRES_USER -d $(DB)

db:shell:
	@docker exec -it $(CONTAINER) bash

db:backup:
	@[ -d backups ] || mkdir -p backups
	@DATE=$$(date +%Y%m%d-%H%M%S); \
	docker exec $(CONTAINER) sh -c "pg_dump -U $$POSTGRES_USER -d $(DB) -f /backups/$(DB)-$${DATE}.sql"; \
	ls -lh backups | tail -n +1

db:restore:
	@if [ -z "$(FILE)" ]; then echo "Usage: make db:restore FILE=backups/<file.sql> [DB=dev]"; exit 1; fi
	@BASENAME=$$(basename -- "$(FILE)"); \
	if [ ! -f "backups/$$BASENAME" ]; then echo "File backups/$$BASENAME not found."; exit 1; fi; \
	echo "Restoring $$BASENAME into $(DB) ..."; \
	docker exec -i $(CONTAINER) psql -U $$POSTGRES_USER -d $(DB) -f /backups/$$BASENAME; \
	echo "Restore complete."
