import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    init,
  );
}

export function errorResponse(
  status: number,
  error: string,
  message: string,
  details?: unknown,
) {
  return NextResponse.json(
    {
      ok: false,
      error,
      message,
      details,
    },
    { status },
  );
}

export async function parseJsonBody<T>(
  request: Request,
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: unknown } },
) {
  const body = await request.json().catch(() => null);
  return schema.safeParse(body);
}
