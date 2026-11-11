# Smart CRM - Mekong Mobile - flow L2

## Requirements

- Node.js v26.12.0 or later (developed on 26)
- pnpm 11 (see `packageManager` in `package.json`)
- PostgreSQL 15 or later - either the bundled Docker image or a server you already run

## Quick start

### 1. Clone the repository

```bash
git clone https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2.git
cd cdtn1-NguyenThaiHoang-L2/src
```

### 2. Prepare the PostgreSQL database

**Option A - use the bundled Docker image (pick this if you have no PostgreSQL).**

Install Docker first if you do not have it: https://www.docker.com/products/docker-desktop/

`docker-compose.yaml` runs `postgres:16-alpine` on `localhost:5432` with the user and
password `postgres`/`postgres`:

```bash
docker compose up -d db
```

That is all the database part needs. To run the application in Docker as well, see
**Running everything in Docker** below.

**Option B - use an existing PostgreSQL (skip Docker entirely).**

Any reachable PostgreSQL 15 or later works: a local install, a container you already run,
or a managed server. Create the database once, then point `DATABASE_URL` at it in step 3:

```bash
createdb capstoneone     # or: CREATE DATABASE capstoneone;
```

**Option C - Prisma Postgres through the Composer.**

```bash
pnpm run dev:composer
```

This builds the application, provisions a local Prisma Postgres database and applies the
schema, so steps 2 to 5 are covered. For a plain Vite dev server, use `pnpm run dev`.

> **If you share a Docker container with another project**, do not run
> `docker compose down -v`. It deletes the named volume and every database inside it,
> including another project's data. The safe way to stop is `docker compose stop db`.

### 3. Configure the environment

```bash
cp .env.example .env
```

`.env.example` documents every variable. The only required one is `DATABASE_URL`; the
`DEV_*` group is a development convenience described below.

### 4. Install dependencies

```bash
pnpm install
```

### 5. Create the schema and load sample data

```bash
pnpm run db:init     # creates six tables, their constraints and indexes
pnpm run db:seed     # loads categories, the demo customer and devices
```

`db:init` applies `src/prisma/contract.ts` to an empty database and signs it. `db:seed` is
safe to run repeatedly. It adds six issue categories, two employees, and one demo customer
with three devices.

### 6. Run the application

```bash
pnpm run dev
```

Vite serves the application on `http://localhost:5173`, or the next free port if that one is
taken - read the port it prints. Then open `/` and sign in.

### 7. Sign in

Two demo accounts share the `/login` page:

| Account | Password | Role | Landing page |
|---|---|---|---|
| `admin` | `admin` | Centre manager | `/duyetPhieuBaoHanh` |
| `employee` | `employee` | Intake clerk | `/traCuuKhachHang` |

Signing in only changes the identity inside the session (a `session` cookie, 8 hours).
Visit `/logout` to clear it. While signed out, every screen under `(app)` redirects to
`/login`.

## Running everything in Docker

`Dockerfile` packages the application in multiple stages, and `docker-compose.yaml` brings
up PostgreSQL, the schema and seed step, and the application:

```bash
docker compose up -d --build
```

Open `http://localhost:3000`. The `init` service runs `db:init` and `db:seed` once (both are
safe to repeat) and exits, and only then does the `app` service start. PostgreSQL data lives
in the named volume `postgres-data`.

The test suite runs inside the container on demand, not as part of `up`:

```bash
docker compose run --rm test
```

Build the database alone (for use with `pnpm run dev`):

```bash
docker compose up -d db
```

## Common commands

| Command | Effect |
|---|---|
| `pnpm run dev` | Run the Vite dev server |
| `pnpm run check` | Run `svelte-check` across Svelte and TypeScript |
| `pnpm run build` | Build the production bundle |
| `pnpm run db:init` | Create the tables from the contract |
| `pnpm run db:update` | Push contract changes to an existing database |
| `pnpm run db:verify` | Compare the database against the contract |
| `pnpm run db:seed` | Load sample data (safe to repeat) |
| `pnpm run contract:emit` | Regenerate `contract.json` / `contract.d.ts` after editing the contract |
| `pnpm run migration:status` | Compare the migration graph with the marker in the database |
| `pnpm run test` | Run the Vitest suite once |
| `pnpm run test:watch` | Run Vitest in watch mode |

## Testing

```bash
pnpm run test          # once
pnpm run test:watch    # watch mode
```

`tests/` holds fourteen cases. The first eight run on pure functions and on services with
fake objects, and need no database: phone masking (NFR2), phone normalisation (BR-02),
commitment deadlines (BR-09, BR-10, including the skipped Sunday), ticket code generation
and the first log row (BR-07, BR-08), refusing a second ticket on the same device (BR-06),
and purchase date validation (BUG-02, BUG-03). The remaining six need the test database.

The suite runs against `capstoneone_test` and **never** touches `capstoneone`:
`tests/helpers/setup-env.ts` points the test process's `DATABASE_URL` at the test database,
so `.env` does not need editing. That database is created once by
`docker/init/01-capstoneone-test.sql` while the volume is empty, and the compose `init`
service applies the schema and seed to it. Each case creates its own customer and device
with clock-derived keys, so repeated runs do not collide.

## Screens

| Screen | Path | Role | Function |
|---|---|---|---|
| Customer look-up | `/traCuuKhachHang` | both roles | Find a customer by phone, see their devices, create a new customer |
| Create warranty ticket | `/taoPhieuBaoHanh` | Intake clerk | Register a device, create a ticket, see the generated code and due date |
| Decide warranty type | `/duyetPhieuBaoHanh` | Centre manager | Approval queue, overdue tickets first, approve or reject with a reason |

## API

`Content-Type: application/json`. Field names are `snake_case` and match the database column
names. Timestamps are ISO 8601 in Vietnam time (`2026-09-08T14:30:00+07:00`).

| # | Method | Path | Intake clerk | Centre manager |
|---|---|---|---|---|
| 1 | GET | `/api/customers?phone=` | 200 | 200 |
| 2 | POST | `/api/customers` | 201 | 403 |
| 3 | POST | `/api/devices` | 201 | 403 |
| 4 | GET | `/api/issue-categories` | 200 | 200 |
| 5 | POST | `/api/tickets` | 201 | 403 |
| 6 | GET | `/api/tickets` | 403 | 200 |
| 7 | PATCH | `/api/tickets/{ticket_id}/warranty-decision` | 403 | 200 |

**The last two columns describe the intended role design, not the current behaviour.**
`AUTHORIZATION_ENFORCED` in `src/services/access.ts` is `false`, so role guards do nothing
and every authenticated caller reaches every endpoint. Only the centre rule is always
enforced. `docs/api-docs.md` documents what the running system actually does.

`GET /api/tickets` accepts the optional parameters `category_id`, `warranty`
(`CHUA_DUYET` | `MIEN_PHI` | `TINH_PHI`), `page` and `size` (default 20, maximum 100).
Results arrive already sorted: overdue tickets first, then those still in time, each group
ascending by `due_date`. The client does not re-sort.

Every response carries `phone_masked` in the form `090****567`. The full phone number is
never returned on any endpoint (NFR2, QT-15).

### Error shape

Every error uses one shape:

```json
{ "error": { "code": "MA_LOI", "message": "Thông báo cho người dùng", "fields": { "ten_truong": "chi tiết" } } }
```

| Code | HTTP | When |
|---|---|---|
| `UNAUTHENTICATED` | 401 | Missing or expired token |
| `FORBIDDEN_ROLE` | 403 | The role may not call this endpoint (dormant while role checks are off) |
| `CENTER_OUT_OF_SCOPE` | 403 | The ticket belongs to another centre |
| `INVALID_PHONE` | 400 | The phone number is invalid after normalisation |
| `VALIDATION_FAILED` | 400 | A field is missing or of the wrong type |
| `REASON_REQUIRED` | 400 | Rejecting a ticket without giving a reason |
| `PARAM_INVALID` | 400 | A query parameter is invalid |
| `CUSTOMER_NOT_FOUND` | 404 | No customer matches the phone or `customer_id` |
| `DEVICE_NOT_FOUND` | 404 | `device_id` does not exist or does not belong to the customer |
| `CATEGORY_NOT_FOUND` | 404 | `category_id` is not in the category list |
| `TICKET_NOT_FOUND` | 404 | `ticket_id` does not exist |
| `CUSTOMER_EXISTS` | 409 | The phone number is already stored |
| `SERIAL_OWNED_BY_OTHER` | 409 | The serial already belongs to another customer |
| `DEVICE_HAS_OPEN_TICKET` | 409 | The device already has an undecided ticket |
| `ALREADY_DECIDED` | 409 | The ticket already has a decision |

There is no `422`. An expired warranty is not an error: every ticket is created in the
pending state.

## Access control

Authentication is a stub. `src/hooks.server.ts` reads the identity from two places: the
`session` cookie set by `/login`, or an
`Authorization: Bearer <base64 of {"employee_id","role","center_code"}>` header for scripts
calling the API. Both carry the same payload.

In development, a request to `/api/` that carries no identity falls back to the `DEV_*`
variables, so `curl` and scripts can call the API without a token. The screens always
require signing in.

**Role checks are switched off on purpose so anyone can open every screen.**
`AUTHORIZATION_ENFORCED` in `src/services/access.ts` is `false`, which makes
`requireReceptionist` and `requireManager` do nothing. Set it to `true` to restore the table
in the API section: intake clerks get `POST /api/customers`, `POST /api/devices` and
`POST /api/tickets`; only centre managers read the queue or decide a ticket.

The centre rule (BR-17, QT-14) is always applied: a caller only sees tickets whose
`center_code` matches their token. In development the default is `TT01` and the sample data
sits there too, so normally you will not notice a difference.

## Database and contract

`src/prisma/contract.ts` is the single source of truth for the schema. The DDL is generated
from it, so there is no hand-written `.sql` file to drift away from the schema. After
editing the contract:

```bash
pnpm run contract:emit    # regenerate contract.json / contract.d.ts
pnpm run db:update        # apply it to the database
```

`migrations/` holds the Prisma migration artefacts and snapshots. Note that
`pnpm run migration:status` may report that the marker in the database does not match the
migration graph on disk - that only means the database was last updated through `db:update`
rather than through the migration flow. It is not an error and the schema is still correct.

## Further documentation

| Document | Contents |
|---|---|
| `docs/deployment-guide.md` | English deployment guide: requirements, setup, variables, sample data, verification |
| `docs/api-docs.md` | English API reference for all seven endpoints, with real request and response examples |
| `docs/checklist-bao-mat.md` | Seven-item security checklist with evidence per item |
| `docs/test-plan.md` | Test plan, four sections |
| `docs/test-report.md` | Twelve cases in eight columns, plus the OWASP security checks |
| `docs/bug-log.md` | Four fixed bugs, seven lines each, with commit links |
| `docs/postman-collection.json` | Postman collection for the seven endpoints |
| `docs/screenshots/` | Evidence images: per case, white machine test, screens, screen states |
| `docs/thay-doi-thiet-ke.md` | Design change log after the Session 6 and Session 12 feedback |
