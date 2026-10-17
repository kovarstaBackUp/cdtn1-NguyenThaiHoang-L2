import type { RequestHandler } from './$types';

import { readJsonBody, toErrorResponse } from '#lib/server/api';
import { requireActor } from '#lib/server/auth';
import { requireReceptionist } from '#services/access';
import { customerService } from '#services/customer.service';
import { validateCustomerInput, validateCustomerPhone } from '#validators/customer.validator';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const actor = requireActor(locals);
    const phone = validateCustomerPhone(url.searchParams.get('phone') ?? '');

    return Response.json(await customerService.search(actor, phone));
  } catch (thrown) {
    return toErrorResponse(thrown);
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    requireReceptionist(requireActor(locals));

    const input = validateCustomerInput(await readJsonBody(request));

    return Response.json(await customerService.create(input), { status: 201 });
  } catch (thrown) {
    return toErrorResponse(thrown);
  }
};
