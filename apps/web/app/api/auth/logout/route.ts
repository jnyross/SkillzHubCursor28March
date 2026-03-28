import { NextResponse } from "next/server";

import { clearAuthSession } from "../../../../../lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthSession(response);
  return response;
}
