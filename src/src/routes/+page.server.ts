import { redirect } from '@sveltejs/kit';

import { landingFor } from '#lib/server/session';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.employee) {
    redirect(303, '/login');
  }

  redirect(303, landingFor(locals.employee.role));
};
