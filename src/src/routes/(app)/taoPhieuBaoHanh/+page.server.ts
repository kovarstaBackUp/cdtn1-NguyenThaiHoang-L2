import type { PageServerLoad } from './$types';

import { api } from '#lib/server/api';
import type { Customer } from '#lib/types/customer';
import type { IssueCategoryList } from '#lib/types/issue-category';

export const load: PageServerLoad = async ({ url, fetch }) => {
  const phone = url.searchParams.get('phone');

  const [customer, categories] = await Promise.all([
    phone
      ? api<Customer>(fetch, `/api/customers?phone=${encodeURIComponent(phone)}`)
      : Promise.resolve(null),
    api<IssueCategoryList>(fetch, '/api/issue-categories'),
  ]);

  return { customer, categories: categories.items };
};
