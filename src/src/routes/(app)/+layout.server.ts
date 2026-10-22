import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

// Every screen in this group needs a signed-in identity. /login and /api sit
// outside the group.
export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.employee) {
    redirect(303, '/login');
  }
};
