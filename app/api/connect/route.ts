import { NextResponse } from "next/server";

import { attach, slot } from "@/lib/accounts";
import { pasted, whoami } from "@/lib/riot";

export const runtime = "nodejs";

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const raw = typeof body?.cookie === "string" ? body.cookie : "";
  const jar = pasted(raw);

  if (!jar.ssid) {
    return NextResponse.json({ error: "no ssid found" }, { status: 400 });
  }

  const who = await whoami(jar);
  if (!who) {
    return NextResponse.json({ error: "cookie rejected" }, { status: 401 });
  }

  const response = NextResponse.json({ handle: who.handle });
  attach(response, {
    handle: who.handle,
    id: slot(who.puuid),
    jar: who.jar,
  });
  return response;
};
