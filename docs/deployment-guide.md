# Deployment Guide

Smart CRM, Mekong Mobile. Ticket intake and warranty classification flow L2, track SE.

Everything runs in Docker. You do not need Node.js, pnpm or PostgreSQL on the host. Every
command below is copied from a run that was actually executed.

## 1. Requirements

| Item | Minimum |
| :--- | :--- |
| Docker Engine or Docker Desktop with Compose v2 | `docker compose version` prints v2 or later |
| Free disk space | About 6 GB, the two images are 1,96 GB and 2,57 GB |
| Free TCP ports | 3000 for the application, 5432 for PostgreSQL |
| Git | To clone the repository |

Check Compose is available:

```
docker compose version
```

## 2. Setup steps

```
git clone --branch v1.0 https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2.git
cd cdtn1-NguyenThaiHoang-L2/src
docker compose up -d --build
```

That is one command after cloning. Nothing else is required, and there is no `.env` step
because every environment variable the containers need is set inside `docker-compose.yaml`.

If you ran the stack before on this machine, start from a clean state instead:

```
docker compose down -v
docker compose up -d --build
```

`down -v` deletes the database volume, so the database is created again from nothing. Do
not skip it when re-running the white machine test: a leftover container can start but no
longer answer to the service name `db`, and the `init` service then stops with
`getaddrinfo ENOTFOUND db`.

What the three services do:

| Service | Role |
| :--- | :--- |
| `db` | PostgreSQL 16 with a healthcheck on `pg_isready` |
| `init` | Applies the schema and seeds data for both databases, then exits 0 |
| `app` | The built SvelteKit application, served by `node build` on port 3000 |

`init` is not a server. It runs once per `up` and stops, and `app` waits for it to finish
successfully.

## 3. Environment variables

The containers read these from `docker-compose.yaml`. You do not set them by hand.

| Variable | Where it is set | Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | `init`, `app`, `test` | `postgresql://postgres:postgres@db:5432/capstoneone` |
| `TEST_DATABASE_URL` | `test` | `postgresql://postgres:postgres@db:5432/capstoneone_test` |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | `db` | `capstoneone`, `postgres`, `postgres` |
| `NODE_ENV`, `HOST`, `PORT` | `app` | `production`, `0.0.0.0`, `3000` |

Those credentials are development values for a local container only. Nothing in this
repository is a production secret, and no `.env` file is committed; `.env.example` lists
the variables for the non-Docker development flow.

If you run the application outside Docker with `pnpm run dev`, then `.env` is needed and
`.env.example` documents it, including the optional `DEV_*` identity variables.

## 4. Sample data

The `init` service applies `src/prisma/contract.ts` to both databases and then runs the
seed. After a clean start each database contains:

| Table | Rows | Content |
| :--- | :--- | :--- |
| `issue_category` | 6 | Màn hình, Pin, Sạc, Phần mềm, Nước vào, Khác |
| `employee` | 2 | id 1 NV TT01, id 2 QL TT01 |
| `customer` | 1 | Nguyen Van A, phone 0900000001 |
| `device` | 3 | SN-IP14-000123, SN-SS-S24-000456, SN-XM-13-000789 |
| `ticket` | 0 | Created as you use the application |
| `ticket_status_log` | 0 | Written on every status change |

The seed is idempotent: every insert is an upsert on a business key, so running the seed
again adds nothing. The application database is `capstoneone`, the test database is
`capstoneone_test`, and both are created by the stack itself. `capstoneone_test` is created
by `docker/init/01-capstoneone-test.sql` the first time the volume is initialised.

Two accounts can sign in at `http://localhost:3000/login`: `employee` with password
`employee`, and `admin` with password `admin`. Role checks are deliberately disabled in
this prototype, so both accounts can open both screens; the centre scoping rule is always
enforced. See `docs/checklist-bao-mat.md`.

## 5. Verify it works

Run these four checks from `src/` after `docker compose up -d --build`.

```
docker compose ps
```

Expected: `db` and `app` report `Up ... (healthy)`, and `init` reports `Exited (0)`.

```
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

Expected: `200`. The login page is also reachable with
`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login`, also `200`.

```
docker compose run --rm test
```

Expected: `Test Files 6 passed (6)` and `Tests 14 passed (14)`. The suite runs inside the
container against `capstoneone_test`, so it never touches the application database.

```
docker compose run --rm init
```

Expected: the schema step reports `Applied 0 operation(s)` and the seed prints `seeded`.
This is the second run, and it must not fail or duplicate data. Counting rows afterwards
still gives 6 categories, 2 employees, 1 customer and 3 devices.

The application itself is then at `http://localhost:3000/`.

## Troubleshooting

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `init` exits 2 with `getaddrinfo ENOTFOUND db` | A leftover `db` container from an earlier run that no longer resolves on the current network | `docker compose down -v` then `docker compose up -d --build` |
| `up` fails with `port is already allocated` | Another program holds 3000 or 5432 | Stop it, or change the host side of the mapping in `docker-compose.yaml` |
| `app` is unhealthy but `db` is healthy | `init` did not finish | `docker compose logs init` |
| Login succeeds but creating a ticket fails on a foreign key | The database was not seeded | `docker compose run --rm init` |
