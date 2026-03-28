import { NextResponse } from "next/server";

import { getSessionFromCookieStore } from "../../../../lib/auth";

export async function GET() {
  const session = await getSessionFromCookieStore();

  return NextResponse.json({
    ok: true,
    authenticated: Boolean(session),
    session,
  });
}
