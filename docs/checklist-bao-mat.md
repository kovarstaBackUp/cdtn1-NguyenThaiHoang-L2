# Security checklist

Seven items, the list set by Assignment 3. Each item records a status and one line of
evidence produced by running the command shown. Status is DONE, NOT DONE, or NOT
APPLICABLE; the Session 15 guide accepts all three as long as they are truthful.

Every command below was run against the running Docker stack on 11/11/2026. Images are in
`docs/screenshots/`.

## 1. No secret in the repository - DONE, with a known limitation

Evidence: `git log --all --oneline -- .env src/.env` prints nothing, so `.env` was never
committed. `rg -n "password|secret|api_key|apiKey" src/src` finds no API key, no token and
no connection string.

Image: `docs/screenshots/sec-1.png`

The known limitation, stated rather than hidden: that same grep is **not empty**. It finds
`password: 'admin'` and `password: 'employee'` in `src/routes/login/+page.server.ts`. They
are the two demo accounts, already published in the README and in this submission, so they
are not a leak, but they are credentials hard-coded in source. The fix is to read them from
`DEMO_USER` / `DEMO_PASSWORD` environment variables so the grep comes back clean; it was not
done because it would break the two-command path for anyone who does not set them.

## 2. Input is validated at the application layer - DONE

Evidence: `rg -n "\.query\(|SELECT |INSERT INTO |DELETE FROM |UPDATE .* SET" src/src`
returns fourteen matches, and all fourteen are template strings for ticket codes, URLs,
dates and the phone mask. There is no hand-written SQL anywhere, so no query is built by
concatenation; every read and write goes through the typed ORM.

The injection probe behaves as required: `GET /api/customers?phone=' OR 1=1 --` returns
`400 {"code":"INVALID_PHONE"}` and zero rows, not the customer list.

Image: `docs/screenshots/sec-2.png`

Tests: TC-14 (malformed date refused with 400 and a named field) and TC-19 (injection
attempt) both PASS.

## 3. Access control is enforced on the record - DONE

Evidence: with ticket `BH-000001/2026` owned by centre `TT01`,
`PATCH /api/tickets/1/warranty-decision` with a `TT02` manager token returns
`403 CENTER_OUT_OF_SCOPE`, and the same call with a `TT01` token returns `200` with
`is_warranty: true` and `verified_by: 2`.

Image: `docs/screenshots/TC-18.png`

One honest qualification: the ownership boundary in this system is the **service centre**,
not the individual user, because customer and device records are deliberately shared across
the company (`docs/api-contract.md` section 3). Role-based ownership is designed but not
enforced yet, since `AUTHORIZATION_ENFORCED` is `false`.

## 4. Passwords and sensitive data are hashed or masked - NOT APPLICABLE

Evidence: `\d employee` shows three columns, `employee_id`, `full_name` and `center_code`.
There is no password column and no user table, because signing in is a stub with two
hard-coded demonstration accounts. There is nothing to hash.

Image: `docs/screenshots/sec-4.png`

The related measure this system does take is masking: every response carries only
`phone_masked` in the form `090****567`, never the full number (NFR2, QT-15, test TC-01).

## 5. Error messages do not expose internals - DONE

Evidence: `POST /api/tickets` with the body `{bad json` returns
`400 {"code":"VALIDATION_FAILED", ...}`. With the database stopped,
`GET /api/customers` returns `500 {"status":500,"message":"Internal Error"}`. Neither
response contains a stack trace, a table name or a connection string.

Image: `docs/screenshots/sec-5.png`

## 6. Logs contain no secrets or personal data - DONE

Evidence: `docker compose logs app | grep -iE "password|token|0[0-9]{9}"` prints nothing
across the whole container log, so no token, no password and no Vietnamese phone number
reaches the logs.

Image: `docs/screenshots/sec-6.png`

## 7. Dependencies are pinned and audited - NOT DONE yet

Evidence: `src/pnpm-lock.yaml` is committed, so versions are pinned.
`pnpm audit --prod` reports **one high advisory**: `hono < 4.12.4`, reached through
`.>@prisma/composer>alchemy>@prisma/dev>@hono/node-server>hono`, that is through Prisma's
own tooling rather than through application code.

Image: `docs/screenshots/sec-7.png`

Plan: the advisory is patched in `hono >= 4.12.4`; this project takes it transitively from
the Prisma composer, so the fix is a Prisma upgrade once a release pulls the patched
version. Until then the exposure is limited to the local schema tooling, which is not
reachable from the running application.

## Known limitation outside the seven items

Item 4 is not applicable, but a separate authentication weakness is real and recorded here
rather than omitted. The session token is base64 JSON with no signature, so a self-made
token is accepted: `{"employee_id":1,"role":"QUAN_LY","center_code":"TT99"}` returned `200`
on `/api/customers`. That defeats the centre rule that item 3 relies on.

Test case TC-17 in `docs/test-report.md` records this as FAIL. The fix is to sign the
payload with HMAC-SHA256 and verify it in `hooks.server.ts`; it was not done because every
documented token in this repository is unsigned, so the change invalidates all of them at
once. The Session 15 guide is explicit that an honest "not done" is not penalised, while a
claimed "done" without evidence is.
