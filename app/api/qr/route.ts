import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { create } from "qrcode";

import { attach, slot } from "@/lib/accounts";
import { poll, start } from "@/lib/qr";
import type { Pending } from "@/lib/qr";
import { whoami } from "@/lib/riot";
import { seal, unseal } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PENDING = "hououin.qr";
const COUNTRY = "GB";

const shape = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export const POST = async () => {
  const session = await start(COUNTRY);
  if (!session) {
    return NextResponse.json({ error: "riot refused" }, { status: 502 });
  }

  const code = create(session.url, { errorCorrectionLevel: "H" });
  const response = NextResponse.json({
    cells: Array.from(code.modules.data, (bit) => (bit ? 1 : 0)),
    size: code.modules.size,
  });
  response.cookies.set(PENDING, seal(JSON.stringify(session)), {
    ...shape,
    maxAge: 300,
  });
  return response;
};

export const GET = async () => {
  const jar = await cookies();
  const token = jar.get(PENDING)?.value;
  if (!token) {
    return NextResponse.json({ status: "expired" }, { status: 410 });
  }

  const raw = unseal(token);
  if (!raw) {
    return NextResponse.json({ status: "expired" }, { status: 410 });
  }

  const result = await poll(JSON.parse(raw) as Pending, COUNTRY);
  if (result.status !== "done") {
    return NextResponse.json({
      stage: "stage" in result ? result.stage : undefined,
      status: result.status,
    });
  }

  const who = await whoami(result.jar);
  if (!who) {
    return NextResponse.json({ status: "failed" });
  }

  const response = NextResponse.json({ handle: who.handle, status: "done" });
  attach(response, { handle: who.handle, id: slot(who.puuid), jar: who.jar });
  response.cookies.delete(PENDING);
  return response;
};
