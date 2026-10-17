import { error } from "@sveltejs/kit";

import { AppError } from "#errors/app-error";

export async function api<T>(
  fetch: typeof globalThis.fetch,
  path: string,
): Promise<T> {
  const res = await fetch(path);

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;

    throw error(res.status, body?.error?.message ?? "Request Failed");
  }

  return res.json() as Promise<T>;
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, unknown>,
): Response {
  const error = {
    code: code,
    message: message,
    fields: fields,
  };

  return Response.json({ error: error }, { status: status });
}

export function toErrorResponse(thrown: unknown): Response {
  if (thrown instanceof AppError) {
    return errorResponse(thrown.status, thrown.code, thrown.message, thrown.fields);
  }

  throw thrown;
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);

  return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
}
