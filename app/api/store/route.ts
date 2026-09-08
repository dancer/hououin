import { NextResponse } from "next/server";

import { attach, chosen } from "@/lib/accounts";
import { shop } from "@/lib/riot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const account = await chosen();
  if (!account) {
    return NextResponse.json({ error: "not connected" }, { status: 401 });
  }

  const live = await shop(account.jar);
  if (!live) {
    return NextResponse.json({ error: "session expired" }, { status: 401 });
  }

  const response = NextResponse.json({
    handle: live.handle,
    offers: live.offers,
    seconds: live.seconds,
  });
  attach(response, { ...account, handle: live.handle, jar: live.jar });
  return response;
};
