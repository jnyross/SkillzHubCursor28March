import { sharedEnv } from "@skill-builder/shared";
import { NextResponse } from "next/server";
import { z } from "zod";

import { badRequest, parseJsonBody, unauthorized } from "../../../../lib/api";
import { createSessionCookie, verifyPassword } from "../../../../lib/auth";

const loginInputSchema = z.object({
  password: z.string().min(1),
  redirectTo: z.string().startsWith("/").optional(),
});

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, loginInputSchema);

  if (!(await verifyPassword(parsed.password))) {
    return unauthorized("INVALID_CREDENTIALS");
  }

  const response = NextResponse.json({
    ok: true,
    user: sharedEnv.APP_LOCAL_USER ?? "local-admin",
    redirectTo: parsed.redirectTo ?? "/projects",
  });

  response.cookies.set(createSessionCookie());
  return response;
}
