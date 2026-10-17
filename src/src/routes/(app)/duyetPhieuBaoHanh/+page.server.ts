import type { PageServerLoad } from "./$types";

import { api } from "#lib/server/api";
import type { TicketList } from "#lib/types/ticket";

export const load: PageServerLoad = async ({ url, fetch }) => {
  const warranty = url.searchParams.get("warranty");

  const tickets = await api<TicketList>(
    fetch,
    warranty
      ? `/api/tickets?warranty=${encodeURIComponent(warranty)}`
      : "/api/tickets",
  );

  return { tickets };
};
