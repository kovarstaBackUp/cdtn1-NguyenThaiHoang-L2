import type { Handle } from "@sveltejs/kit/hooks";
import { dev } from "$app/env";
import {
  DEV_CENTER_CODE,
  DEV_EMPLOYEE_ID,
  DEV_ROLE,
} from "$app/env/private";

import { decodeSession, SESSION_COOKIE } from "#lib/server/session";

export const handle: Handle = async ({ event, resolve }) => {
  const header = event.request.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

  // A page sends the session cookie; a script can send a Bearer token. Both
  // carry the same payload.
  event.locals.employee =
    decodeSession(bearer) ?? decodeSession(event.cookies.get(SESSION_COOKIE));

  // Keep the dev fallback for /api only, so curl and scripts work without a
  // token while the screens still require a login.
  if (!event.locals.employee && dev && event.url.pathname.startsWith("/api/")) {
    event.locals.employee = {
      employeeId: BigInt(DEV_EMPLOYEE_ID),
      role: DEV_ROLE,
      centerCode: DEV_CENTER_CODE,
    };
  }

  return resolve(event);
};
