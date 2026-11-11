# Security checklist

Seven items, one line of evidence each. Status is one of DONE, NOT DONE, or NOT
APPLICABLE. Every result below was produced by running the command or request shown; none
is asserted.

Scope note: this prototype is assessed at awareness level, as the Session 13 guide
describes. Authentication is deliberately a stub, and role checks are switched off on
purpose so a marker can open both screens. Both facts are recorded below instead of being
hidden.

| # | Item | Status | Evidence |
| :--- | :--- | :--- | :--- |
| 1 | No secret in the repository, and `.env` was never committed | DONE | `git log --all --oneline -- .env` prints nothing, and `git ls-files` lists only `.env.example`. Only development values appear in `docker-compose.yaml` |
| 2 | Error responses do not leak stack traces, table names or connection strings | DONE | `POST /api/tickets` with `device_id: 999999` returns `404 {"error":{"code":"DEVICE_NOT_FOUND","message":"Thiết bị không thuộc về khách hàng này"}}`. `PATCH` from another centre returns `403 {"code":"CENTER_OUT_OF_SCOPE"}`. No response contains a stack, a table name or a `postgresql://` string |
| 3 | Passwords are stored hashed | NOT APPLICABLE | The `employee` table has no password column, and no user account is stored in the database. Sign in uses two hard-coded accounts in `src/src/lib/server/session.ts` for the demonstration. There is nothing to hash |
| 4 | Access control: a manager cannot decide another centre's ticket | DONE | Created `BH-000001/2026` in `TT01`. `PATCH /api/tickets/1/warranty-decision` with a `TT02` manager token returns `403 CENTER_OUT_OF_SCOPE`; the same request with a `TT01` manager token returns `200` with `is_warranty: true` and `verified_by: 2`. Test case TC-11 covers the same rule |
| 5 | Access control: a caller sees only its own centre's tickets | DONE | `GET /api/tickets` with the `TT02` token returns `{"total":0,"page":1,"size":20,"items":[]}` even though `TT01` has one ticket, so the list is filtered by centre |
| 6 | Injection through the search field | DONE | `GET /api/customers?phone=%27%20OR%201%3D1%20--` returns `400 {"code":"INVALID_PHONE"}` and no rows. The value is echoed back inside a JSON field and is never executed or concatenated into SQL |
| 7 | Authentication rejects a missing or tampered token | NOT DONE | Missing token returns `401 UNAUTHENTICATED` and a token altered inside the payload returns `401`, so both of those behave. But the token is unsigned base64 JSON, so a self-made token is accepted: `{"employee_id":1,"role":"QUAN_LY","center_code":"TT99"}` returned `200` on `/api/customers`. Anyone can mint a token for any employee and any centre, which also defeats the centre scoping above |

## What item 7 needs, and why it was not changed now

The token carries the actor as base64 JSON with no signature, so integrity cannot be
checked. The fix is to sign the payload: compute an HMAC-SHA256 over the JSON with a secret
read from the environment, append it, and verify it in `hooks.server.ts` before trusting the
actor. That is roughly twenty lines across `src/src/lib/server/session.ts` and the hook.

It was left undone on purpose. Every documented token in this repository, including the
ones in the Bug Log reproduction steps and the submission form, is an unsigned token; adding
a signature invalidates all of them at once, and the demonstration would break unless every
document is regenerated in the same change. Recording the gap honestly is worth more than a
last-minute change that breaks the demo.

## Checks that were run and are already covered by the test suite

| Check | Where |
| :--- | :--- |
| Centre scoping rejects a decision from another centre | TC-11, `tests/database.test.ts` |
| A second open ticket on the same device is refused with 409 | TC-08, `tests/ticket-service.test.ts` |
| Malformed or impossible dates are refused with 400 before reaching the database | TC-14, `tests/device-validator.test.ts` |
| The phone number is masked in every response | TC-01, `tests/phone.test.ts` |
