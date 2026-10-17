import type { RequestHandler } from './$types';

import { toErrorResponse } from '#lib/server/api';
import { requireActor } from '#lib/server/auth';
import { ticketService } from '#services/ticket.service';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    requireActor(locals);

    return Response.json(await ticketService.listCategories());
  } catch (thrown) {
    return toErrorResponse(thrown);
  }
};
