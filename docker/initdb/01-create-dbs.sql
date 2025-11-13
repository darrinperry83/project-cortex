-- Runs only on first initialization (empty PGDATA). Creates logical DBs.
-- Owner will be POSTGRES_USER (superuser) by default; adjust later if needed.

CREATE DATABASE sandbox;
CREATE DATABASE dev;
CREATE DATABASE prod;
