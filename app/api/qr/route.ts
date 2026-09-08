import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { toDataURL } from "qrcode";

import { poll, start } from "@/lib/qr";
import type { Pending } from "@/lib/qr";
import { COOKIE, seal, unseal } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PENDING = "hououin.qr";
const MONTH = 60 * 60 * 24 * 30;
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

  const image = await toDataURL(session.url, {
    color: { dark: "#121211", light: "#eeedeb" },
    margin: 1,
    width: 512,
  });

  const response = NextResponse.json({ image, url: session.url });
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
    return NextResponse.json({ status: result.status });
  }

  const response = NextResponse.json({ status: "done" });
  response.cookies.set(COOKIE, seal(JSON.stringify(result.jar)), {
    ...shape,
    maxAge: MONTH,
  });
  response.cookies.delete(PENDING);
  return response;
};
