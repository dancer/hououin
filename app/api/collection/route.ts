import { NextResponse } from "next/server";

import { attach, chosen } from "@/lib/accounts";
import { collection } from "@/lib/riot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const account = await chosen();
  if (!account) {
    return NextResponse.json({ error: "not connected" }, { status: 401 });
  }

  const owned = await collection(account.jar);
  if (!owned) {
    return NextResponse.json({ error: "session expired" }, { status: 401 });
  }

  const response = NextResponse.json({
    handle: owned.handle,
    skins: owned.skins,
  });
  attach(response, { ...account, handle: owned.handle, jar: owned.jar });
  return response;
};
