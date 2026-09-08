import { NextResponse } from "next/server";

import { activate, forget, roster } from "@/lib/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const all = await roster();
  return NextResponse.json({
    accounts: all.map((entry) => ({ handle: entry.handle, id: entry.id })),
  });
};

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const all = await roster();
  if (!all.some((entry) => entry.id === id)) {
    return NextResponse.json({ error: "unknown account" }, { status: 404 });
  }
  const response = NextResponse.json({ ok: true });
  activate(response, id);
  return response;
};

export const DELETE = async (request: Request) => {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const all = await roster();
  const response = NextResponse.json({
    remaining: all.filter((entry) => entry.id !== id).length,
  });
  forget(response, id);
  const next = all.find((entry) => entry.id !== id);
  if (next) {
    activate(response, next.id);
  }
  return response;
};
