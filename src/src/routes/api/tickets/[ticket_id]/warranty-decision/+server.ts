import type { RequestHandler } from "./$types";

import { readJsonBody, toErrorResponse } from "#lib/server/api";
import { requireActor } from "#lib/server/auth";
import { requireManager } from "#services/access";
import { decisionService } from "#services/decision.service";
import {
  validateTicketId,
  validateWarrantyDecisionInput,
} from "#validators/warranty-decision.validator";

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  try {
    const actor = requireActor(locals);
    requireManager(actor);

    const ticketId = validateTicketId(params.ticket_id);
    const input = validateWarrantyDecisionInput(await readJsonBody(request));

    return Response.json(await decisionService.decide(actor, ticketId, input));
  } catch (thrown) {
    return toErrorResponse(thrown);
  }
};
