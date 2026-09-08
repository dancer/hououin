import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { shop } from "@/lib/riot";
import { COOKIE, seal, unseal } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONTH = 60 * 60 * 24 * 30;

export const GET = async () => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "not connected" }, { status: 401 });
  }

  const ssid = unseal(token);
  if (!ssid) {
    return NextResponse.json({ error: "bad session" }, { status: 401 });
  }

  const live = await shop(ssid);
  if (!live) {
    return NextResponse.json({ error: "session expired" }, { status: 401 });
  }

  const response = NextResponse.json({
    handle: live.handle,
    offers: live.offers,
    seconds: live.seconds,
  });
  response.cookies.set(COOKIE, seal(live.ssid), {
    httpOnly: true,
    maxAge: MONTH,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
};
