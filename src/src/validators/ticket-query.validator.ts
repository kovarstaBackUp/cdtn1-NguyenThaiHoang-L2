import { AppError } from '#errors/app-error';

import { toQueryInt } from './common';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const WARRANTY_FILTERS = ['CHUA_DUYET', 'MIEN_PHI', 'TINH_PHI'] as const;

export type WarrantyFilter = (typeof WARRANTY_FILTERS)[number];

export type TicketListQuery = {
  page: number;
  size: number;
  categoryId: number | null;
  warranty: WarrantyFilter | null;
};

export function validateTicketListQuery(searchParams: URLSearchParams): TicketListQuery {
  const page = toQueryInt(searchParams.get('page'), 1, Number.MAX_SAFE_INTEGER);
  const size = toQueryInt(searchParams.get('size'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  if (page === null || size === null) {
    throw new AppError('PARAM_INVALID', 'Tham số phân trang không hợp lệ');
  }

  const rawWarranty = searchParams.get('warranty')?.trim() ?? '';
  const warranty = rawWarranty === '' ? null : rawWarranty;
  if (warranty !== null && !WARRANTY_FILTERS.includes(warranty as WarrantyFilter)) {
    throw new AppError('PARAM_INVALID', 'Hình thức phiếu không hợp lệ');
  }

  const rawCategory = searchParams.get('category_id')?.trim() ?? '';
  let categoryId: number | null = null;
  if (rawCategory !== '') {
    categoryId = toQueryInt(rawCategory, 0, Number.MAX_SAFE_INTEGER);
    if (categoryId === null) {
      throw new AppError('PARAM_INVALID', 'Nhóm sự cố không hợp lệ');
    }
  }

  return { page, size, categoryId, warranty: warranty as WarrantyFilter | null };
}
