# SQLite → PostgreSQL (Local Dev via Docker Compose) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate local development database from SQLite to PostgreSQL 18 running in Docker Compose, aligning local dev with the production target.

**Architecture:** A `docker-compose.yml` at the project root spins up a PostgreSQL 18 container with a named volume. The backend `.env` is updated to connect via `pgsql`. All migrations and seeders run on the fresh PostgreSQL instance. The `.env.example` is updated to document the new pgsql config so other devs can replicate the setup.

**Tech Stack:** Docker Compose v2, PostgreSQL 18, Laravel 13 (PHP 8.5), `pdo_pgsql` PHP extension.

**Spec:** `docs/DEVELOPMENT_RULES.md`, `docs/PRD.md`

## Global Constraints

- All migrations and queries MUST remain compatible with both SQLite and PostgreSQL — no JSONB operators, no PG-specific array syntax, no DB triggers.
- Do NOT add or change Composer/npm dependencies without user approval.
- Do NOT edit existing migration files — only verify they run cleanly.
- `pdo_pgsql` must already be available in the PHP install (verify before connecting).
- Seeders run in this order: `RoleSeeder → UserSeeder → RbacSeeder → MasterSeeder`.
- Run `vendor/bin/pint --dirty --format agent` after any PHP file changes.
- Use `npm.cmd --prefix frontend run build` for frontend verification (not `npm run build`).

## Review Focus

- **Session driver** — current `.env` uses `SESSION_DRIVER=file`; PostgreSQL-backed sessions require `SESSION_DRIVER=database`. Verify the `sessions` table exists or switch driver before migrating.
- **Cache and queue drivers** — `.env.example` defaults `CACHE_STORE=database` and `QUEUE_CONNECTION=database`; confirm those tables are created by `migrate:fresh`.
- **`pdo_pgsql` extension absent** — if PHP was installed without it, the connection fails silently-ish. Step 1 adds an explicit extension check before any DB work.
- **Named volume data not cleared between fresh runs** — `migrate:fresh --seed` drops and recreates tables but doesn't wipe the Docker volume; a corrupt state requires `docker compose down -v`. Document this in the compose file comments.
- **`.env` not committed** — after the switch, `backend/.env.example` must reflect `pgsql` so the next developer cloning the repo knows what to configure.

---

## Task 1: Docker Compose Setup

**Files:**
- Create: `docker-compose.yml` (project root)

**Interfaces:**
- Produces: PostgreSQL 18 service named `db`, reachable at `127.0.0.1:5432`, credentials `sipbaja`/`secret`, database `sipbaja_dev`.

- [ ] **Step 1: Create `docker-compose.yml`**

  ```yaml
  # docker-compose.yml
  # To reset data entirely: docker compose down -v && docker compose up -d
  services:
    db:
      image: postgres:18-alpine
      restart: unless-stopped
      environment:
        POSTGRES_DB: sipbaja_dev
        POSTGRES_USER: sipbaja
        POSTGRES_PASSWORD: secret
      ports:
        - "5432:5432"
      volumes:
        - pgdata:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U sipbaja -d sipbaja_dev"]
        interval: 5s
        timeout: 5s
        retries: 10

  volumes:
    pgdata:
  ```

- [ ] **Step 2: Start the container and verify healthy**

  Run: `docker compose up -d`
  Expected: `db` container reaches `healthy` status.

  Run: `docker compose ps`
  Expected: `db` shows `running (healthy)`.

- [ ] **Step 3: Commit**

  ```bash
  git add docker-compose.yml
  git commit -m "chore: add docker-compose for local postgres dev"
  ```

---

## Task 2: Backend `.env` Configuration

**Files:**
- Modify: `backend/.env`
- Modify: `backend/.env.example`

**Interfaces:**
- Consumes: Docker Compose `db` service from Task 1 (host `127.0.0.1`, port `5432`, db `sipbaja_dev`, user `sipbaja`, password `secret`).
- Produces: Laravel configured to use `pgsql` driver.

- [ ] **Step 1: Verify `pdo_pgsql` is available**

  Run: `php -m | findstr pgsql`
  Expected: line `pdo_pgsql` appears. If absent, stop and notify the user — the extension must be enabled in `php.ini` before continuing.

- [ ] **Step 2: Update `backend/.env` DB block**

  Replace the DB section:
  ```dotenv
  DB_CONNECTION=pgsql
  DB_HOST=127.0.0.1
  DB_PORT=5432
  DB_DATABASE=sipbaja_dev
  DB_USERNAME=sipbaja
  DB_PASSWORD=secret
  ```

- [ ] **Step 3: Update `backend/.env.example` DB block**

  Replace the DB section (and uncomment the extra lines):
  ```dotenv
  DB_CONNECTION=pgsql
  DB_HOST=127.0.0.1
  DB_PORT=5432
  DB_DATABASE=sipbaja_dev
  DB_USERNAME=sipbaja
  DB_PASSWORD=secret
  ```

- [ ] **Step 4: Clear Laravel config cache**

  Run: `php artisan --working-dir=backend config:clear`
  Expected: `Configuration cache cleared successfully.`

- [ ] **Step 5: Commit**

  ```bash
  git add backend/.env.example
  git commit -m "chore: switch local dev DB to PostgreSQL via docker-compose"
  ```
  Note: `backend/.env` is gitignored — do NOT add it to the commit.

---

## Task 3: Migration & Seeder Verification

**Files:**
- No new files. Read-only verification of `backend/database/migrations/` and `backend/database/seeders/`.

**Interfaces:**
- Consumes: pgsql connection from Task 2.
- Produces: Clean schema + seed data in `sipbaja_dev` PostgreSQL database; all 29 migrations pass.

- [ ] **Step 1: Run `migrate:fresh --seed`**

  Run (from project root):
  ```bash
  php artisan --working-dir=backend migrate:fresh --seed --force
  ```
  Expected: All 29 migrations run without error; seeders `RoleSeeder`, `UserSeeder`, `RbacSeeder`, `MasterSeeder` complete successfully.

- [ ] **Step 2: If any migration fails, identify the cause**

  Inspect the failing migration file. Check for:
  - `->integer()->unsigned()->autoIncrement()` vs `->id()` — both work on PG, no action needed.
  - Any raw `DB::statement()` with SQLite-specific SQL — fix to use cross-compatible syntax, then re-run Step 1.

  > **DEVELOPMENT_RULES.md constraint:** Do NOT use PostgreSQL-specific features. Fix must remain SQLite-compatible too.

- [ ] **Step 3: Verify row counts as smoke test**

  Run:
  ```bash
  php artisan --working-dir=backend tinker --execute 'echo \App\Models\User::count() . " users\n"; echo \App\Models\Role::count() . " roles\n";'
  ```
  Expected: counts match the seeder definitions (at minimum 1 user, seeded roles present).

- [ ] **Step 4: Commit if any migration files were fixed**

  Only commit if Step 2 required actual file edits:
  ```bash
  git add backend/database/migrations/<fixed-file>.php
  git commit -m "fix: make migration cross-compatible with PostgreSQL"
  ```
  If Step 1 passed clean, skip this step.

---

## Task 4: Test Suite Gate

**Files:**
- No new files. Runs existing PHPUnit suite.

**Interfaces:**
- Consumes: PostgreSQL DB from Tasks 1–3.
- Produces: Full test suite green on PostgreSQL.

- [ ] **Step 1: Run full backend test suite**

  Run:
  ```bash
  php backend/vendor/bin/phpunit -c backend/phpunit.xml
  ```
  Expected: 93 tests, 93 passed, 470 assertions. Zero failures, zero errors.

- [ ] **Step 2: If tests use an in-memory SQLite override, update `phpunit.xml`**

  Check `backend/phpunit.xml` for:
  ```xml
  <env name="DB_CONNECTION" value="sqlite"/>
  <env name="DB_DATABASE" value=":memory:"/>
  ```
  If present, decide: keep SQLite for speed (acceptable — tests remain cross-compatible) or switch to pgsql. Ask the user before changing `phpunit.xml` — this affects CI.

- [ ] **Step 3: Commit if `phpunit.xml` was changed**

  Only if Step 2 resulted in a change:
  ```bash
  git add backend/phpunit.xml
  git commit -m "chore: update phpunit env to use postgresql for test suite"
  ```

---

## Task 5: Frontend Build Check

**Files:**
- No changes. Verification only.

**Interfaces:**
- Consumes: nothing from prior tasks (frontend is DB-agnostic).
- Produces: confirmed frontend build still passes after backend changes.

- [ ] **Step 1: Run frontend build**

  Run: `npm.cmd --prefix frontend run build`
  Expected: build succeeds with zero TypeScript errors and zero Vite errors.

- [ ] **Step 2: Commit if build passes**

  No frontend files changed — nothing to commit. If build fails, fix TypeScript errors before marking this task done.

---

## Task 6: Documentation Update

**Files:**
- Modify: `docs/DEVELOPMENT_RULES.md` (add Docker setup section)
- Modify: `README.md` if a local dev setup section exists

**Interfaces:**
- Consumes: completed Tasks 1–5.
- Produces: updated developer onboarding docs reflecting Docker Compose setup.

- [ ] **Step 1: Add Docker setup section to `docs/DEVELOPMENT_RULES.md`**

  Add under the existing database section (or at the top of Section 2):
  ```markdown
  ### Local Database (Docker Compose)

  Run `docker compose up -d` from the project root to start PostgreSQL 18.
  Credentials: host `127.0.0.1`, port `5432`, db `sipbaja_dev`, user `sipbaja`, password `secret`.

  To reset data: `docker compose down -v && docker compose up -d`, then re-run `php artisan --working-dir=backend migrate:fresh --seed`.
  ```

- [ ] **Step 2: Update `README.md` local dev prerequisites (if section exists)**

  Add Docker / Docker Compose as a prerequisite alongside PHP 8.5 and Node.

- [ ] **Step 3: Commit**

  ```bash
  git add docs/DEVELOPMENT_RULES.md README.md
  git commit -m "docs: add docker-compose postgres setup to dev docs"
  ```

