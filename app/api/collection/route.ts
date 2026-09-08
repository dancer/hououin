import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { collection } from "@/lib/riot";
import { COOKIE, seal, unseal } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONTH = 60 * 60 * 24 * 30;

export const GET = async () => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const raw = token ? unseal(token) : null;
  if (!raw) {
    return NextResponse.json({ error: "not connected" }, { status: 401 });
  }

  const owned = await collection(JSON.parse(raw));
  if (!owned) {
    return NextResponse.json({ error: "session expired" }, { status: 401 });
  }

  const response = NextResponse.json({
    handle: owned.handle,
    skins: owned.skins,
  });
  response.cookies.set(COOKIE, seal(JSON.stringify(owned.jar)), {
    httpOnly: true,
    maxAge: MONTH,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
};
