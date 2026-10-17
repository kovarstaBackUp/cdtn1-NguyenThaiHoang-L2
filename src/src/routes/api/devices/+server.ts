import type { RequestHandler } from './$types';

import { readJsonBody, toErrorResponse } from '#lib/server/api';
import { requireActor } from '#lib/server/auth';
import { requireReceptionist } from '#services/access';
import { customerService } from '#services/customer.service';
import { validateDeviceInput } from '#validators/device.validator';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    requireReceptionist(requireActor(locals));

    const input = validateDeviceInput(await readJsonBody(request));

    return Response.json(await customerService.registerDevice(input), { status: 201 });
  } catch (thrown) {
    return toErrorResponse(thrown);
  }
};
