import type { Handle } from "@sveltejs/kit/hooks";
import { dev } from "$app/env";
import {
  DEV_CENTER_CODE,
  DEV_EMPLOYEE_ID,
  DEV_ROLE,
} from "$app/env/private";

import { errorResponse } from "#lib/server/api";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.employee = null;

  const header = event.request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
      event.locals.employee = {
        employeeId: BigInt(payload.employee_id),
        role: String(payload.role),
        centerCode: String(payload.center_code),
      };
    } catch {
      event.locals.employee = null;
    }
  }

  if (!event.locals.employee && dev) {
    event.locals.employee = {
      employeeId: BigInt(DEV_EMPLOYEE_ID),
      role: DEV_ROLE,
      centerCode: DEV_CENTER_CODE,
    };
  }

  //if (event.url.pathname.startsWith('/api/') && !event.locals.employee) {
  //  return errorResponse(401, 'UNAUTHENTICATED', 'Vui lòng đăng nhập');
  //}

  return resolve(event);
};
