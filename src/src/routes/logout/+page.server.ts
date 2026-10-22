import { redirect } from '@sveltejs/kit';

import { SESSION_COOKIE } from '#lib/server/session';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });

  redirect(303, '/login');
};
