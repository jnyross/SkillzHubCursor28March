import { sharedEnv } from "@skill-builder/shared";
import { NextResponse } from "next/server";

import { badRequest, jsonError, parseJsonBody } from "../../../../lib/api";
import { createSessionCookie, verifyPassword } from "../../../../lib/auth";

const loginInputSchema = {
  safeParse(value: unknown) {
    const parsed = value as { password?: string; redirectTo?: string } | null;

    if (!parsed?.password || typeof parsed.password !== "string") {
      return {
        success: false as const,
        error: {
          issues: [{ path: ["password"], message: "Password is required." }],
        },
      };
    }

    return {
      success: true as const,
      data: {
        password: parsed.password,
        redirectTo:
          typeof parsed.redirectTo === "string" && parsed.redirectTo.startsWith("/")
            ? parsed.redirectTo
            : "/",
      },
    };
  },
};

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, loginInputSchema);

  if (!parsed.success) {
    return badRequest("INVALID_LOGIN_INPUT", parsed.error);
  }

  if (!verifyPassword(parsed.data.password)) {
    return jsonError("INVALID_CREDENTIALS", "Incorrect local password.", 401);
  }

  const response = NextResponse.json({
    ok: true,
    user: sharedEnv.APP_LOCAL_USER ?? "local-admin",
    redirectTo: parsed.data.redirectTo,
  });

  response.cookies.set(createSessionCookie());
  return response;
}
