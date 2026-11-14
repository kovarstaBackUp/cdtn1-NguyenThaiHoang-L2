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

1. Clone the repository at the tag the submission is graded on:

   ```
   git clone --branch v1.0 https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2.git
   ```

2. Enter the application directory, which is where the compose file lives:

   ```
   cd cdtn1-NguyenThaiHoang-L2/src
   ```

   If you cloned into the current directory instead, with `git clone <url> .`, then the
   repository root is already your working directory and the step becomes `cd src`. The
   compose file is always in `src/`, never at the repository root.

3. Build and start everything:

   ```
   docker compose up -d --build
   ```

That is one command after cloning, so two at most. Nothing else is required, and there is no
`.env` step because every environment variable the containers need is set inside
`docker-compose.yaml`.

If you ran the stack on this machine before, start from a clean state instead. Step 3
becomes two commands, run in this order:

1. Delete the containers and the database volume:

   ```
   docker compose down -v
   ```

2. Build and start again:

   ```
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

The containers read these from `docker-compose.yaml`. You do not set them by hand; the
sample values below are the ones the compose file uses, and they work as they are.

| Name | Meaning | Sample value | Required |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string used by the application and by the schema step | `postgresql://postgres:postgres@db:5432/capstoneone` | Yes, set by the compose file |
| `TEST_DATABASE_URL` | Database the test suite runs against, kept apart from the application database | `postgresql://postgres:postgres@db:5432/capstoneone_test` | Yes for the `test` service, set by the compose file |
| `POSTGRES_DB` | Name of the database created inside the `db` container | `capstoneone` | Yes, set by the compose file |
| `POSTGRES_USER` | Database user, also used by the `pg_isready` healthcheck | `postgres` | Yes, set by the compose file |
| `POSTGRES_PASSWORD` | Database password. A development value for the local container only | `postgres` | Yes, set by the compose file |
| `NODE_ENV` | Runtime mode of the application image | `production` | Yes, set by the compose file |
| `HOST` | Interface the application binds to inside the container | `0.0.0.0` | Yes, set by the compose file |
| `PORT` | Port the application listens on inside the container | `3000` | Yes, set by the compose file |
| `DEV_EMPLOYEE_ID` | Optional development identity used for `/api` calls made outside Docker | `1` | No |
| `DEV_ROLE` | Role that goes with the identity above | `NHAN_VIEN` | No |
| `DEV_CENTER_CODE` | Service centre that goes with the identity above | `TT01` | No |

Nothing in this repository is a production secret, and no `.env` file is committed;
`.env.example` lists the variables needed by the non-Docker development flow, including the
three `DEV_*` ones. Those credentials are development values for a local container, and the
guide recommends changing them before any deployment.

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
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login
```

Expected: `200`.

`GET /` deliberately returns `303` and redirects to `/login`, because no session cookie
is sent. That is the correct behaviour for a request without a session, so verify with
`/login`, not with `/`:

```
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/issue-categories
```

Expected: `401`, because the endpoint requires a token and no `Authorization` header was
sent. A `200` here would mean authentication is not being enforced.

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

## 6. Deployed instance

This submission also runs publicly at **https://capstoneone.kovarsta.com**.

It is not hosted on a cloud free tier. It runs on the author's own homelab machine and is
published through a Cloudflare Tunnel, so no inbound port is open on the host and no
platform specific configuration file exists.

Steps that produced it:

1. On the homelab machine, install Docker Engine with Compose v2, Git and `cloudflared`, and
   verify Docker with `docker compose version`.

2. Clone at the tag and start the stack exactly as in section 2:

   ```
   git clone --branch v1.0 https://github.com/kovarstaBackUp/cdtn1-NguyenThaiHoang-L2.git
   cd cdtn1-NguyenThaiHoang-L2/src
   docker compose up -d --build
   ```

3. In the Cloudflare dashboard, create a named tunnel and add a public hostname
   `capstoneone.kovarsta.com` whose service is `http://localhost:3000`. Copy the tunnel
   token the dashboard shows.

4. Run the tunnel on the same machine, passing the token from the host environment:

   ```
   cloudflared tunnel run --token <TUNNEL_TOKEN>
   ```

5. Verify from outside the network, the same way section 5 verifies locally: `GET /login`
   returns `200`, and `GET /api/issue-categories` returns `401` without a token.

The application variables do not change: the compose file already sets `DATABASE_URL` and
the rest for the containers. The only new value is the Cloudflare tunnel token, which is a
real secret. It stays in the host environment, is never committed and never written into an
image. The database is the same local PostgreSQL container from section 1, so the public URL
serves exactly the sample data described in section 4.

One operational note: the hostname is reachable only while the tunnel process is running. If
`cloudflared` stops, the public URL fails even though the containers are still healthy, so
check the tunnel before a demonstration.

## Troubleshooting

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `init` exits 2 with `getaddrinfo ENOTFOUND db` | A leftover `db` container from an earlier run that no longer resolves on the current network | `docker compose down -v` then `docker compose up -d --build` |
| `up` fails with `port is already allocated` | Another program holds 3000 or 5432 | Stop it, or change the host side of the mapping in `docker-compose.yaml` |
| `app` is unhealthy but `db` is healthy | `init` did not finish | `docker compose logs init` |
| Login succeeds but creating a ticket fails on a foreign key | The database was not seeded | `docker compose run --rm init` |
