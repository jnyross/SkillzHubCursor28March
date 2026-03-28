import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      ok: true,
      ...data,
    },
    init,
  );
}

export function jsonError(
  error: string,
  message: string,
  status: number,
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

export function badRequest(error: string, details?: unknown) {
  return jsonError(error, "The request payload is invalid.", 400, details);
}

export function notFound(error: string, details?: unknown) {
  return jsonError(error, "The requested resource was not found.", 404, details);
}

export function unauthorized(error = "UNAUTHORIZED") {
  return jsonError(error, "Authentication required.", 401);
}

export function serverError(error: unknown) {
  if (error instanceof ZodError) {
    return badRequest("INVALID_PAYLOAD", error.flatten());
  }

  if (error instanceof Error) {
    return jsonError("INTERNAL_ERROR", error.message, 500);
  }

  return jsonError("INTERNAL_ERROR", "Unexpected server error.", 500);
}

export async function parseJsonBody<T>(
  request: Request,
  schema?: ZodType<T>,
): Promise<T | unknown> {
  const body = await request.json().catch(() => {
    throw new Error("INVALID_JSON");
  });

  if (!schema) {
    return body;
  }

  return schema.parse(body);
}
