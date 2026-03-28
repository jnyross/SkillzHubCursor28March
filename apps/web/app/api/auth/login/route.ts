import { sharedEnv } from "@skill-builder/shared";
import { NextResponse } from "next/server";
import { z } from "zod";

import { parseJsonBody, unauthorized, unwrapParsedBody } from "../../../../lib/api";
import { createSessionCookie, verifyPassword } from "../../../../lib/auth";

const loginInputSchema = z.object({
  password: z.string().min(1),
  redirectTo: z.string().startsWith("/").optional(),
});

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, loginInputSchema);
  if (!unwrapParsedBody(parsed)) {
    return parsed.response;
  }

  if (!(await verifyPassword(parsed.data.password))) {
    return unauthorized("INVALID_CREDENTIALS");
  }

  const response = NextResponse.json({
    ok: true,
    user: sharedEnv.APP_LOCAL_USER ?? "local-admin",
    redirectTo: parsed.data.redirectTo ?? "/projects",
  });

  response.cookies.set(createSessionCookie());
  return response;
}
