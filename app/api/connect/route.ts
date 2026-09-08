import { NextResponse } from "next/server";

import { extract, identity, redeem } from "@/lib/riot";
import { COOKIE, seal } from "@/lib/session";

export const runtime = "nodejs";

const MONTH = 60 * 60 * 24 * 30;

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const raw = typeof body?.cookie === "string" ? body.cookie : "";
  const ssid = raw.includes("=") ? extract(raw) : raw.trim();

  if (!ssid) {
    return NextResponse.json({ error: "no ssid found" }, { status: 400 });
  }

  const session = await redeem(ssid);
  if (!session) {
    return NextResponse.json({ error: "cookie rejected" }, { status: 401 });
  }

  const who = await identity(session.tokens);
  const response = NextResponse.json({ handle: who.handle });
  response.cookies.set(COOKIE, seal(session.ssid), {
    httpOnly: true,
    maxAge: MONTH,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
};

export const DELETE = () => {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE);
  return response;
};
