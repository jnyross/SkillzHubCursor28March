import { NextResponse } from "next/server";
import { sharedEnv } from "@skill-builder/shared";

import { createSessionCookie, verifyPassword } from "../../../../lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { password?: string; redirectTo?: string }
    | null;

  if (!body?.password || !verifyPassword(body.password)) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_CREDENTIALS",
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    user: sharedEnv.APP_LOCAL_USER,
    redirectTo: body.redirectTo ?? "/",
  });

  response.cookies.set(createSessionCookie());
  return response;
}
