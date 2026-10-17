import type { RequestHandler } from './$types';

import { readJsonBody, toErrorResponse } from '#lib/server/api';
import { requireActor } from '#lib/server/auth';
import { requireManager, requireReceptionist } from '#services/access';
import { decisionService } from '#services/decision.service';
import { ticketService } from '#services/ticket.service';
import { validateTicketListQuery } from '#validators/ticket-query.validator';
import { validateTicketInput } from '#validators/ticket.validator';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const actor = requireActor(locals);
    requireManager(actor);

    const query = validateTicketListQuery(url.searchParams);

    return Response.json(await decisionService.list(actor, query));
  } catch (thrown) {
    return toErrorResponse(thrown);
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const actor = requireActor(locals);
    requireReceptionist(actor);

    const input = validateTicketInput(await readJsonBody(request));

    return Response.json(await ticketService.create(actor, input), { status: 201 });
  } catch (thrown) {
    return toErrorResponse(thrown);
  }
};
