import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import type { Jar } from "@/lib/jar";
import { seal, unseal } from "@/lib/session";

const PREFIX = "hououin_";
const ACTIVE = "hououin_active";
const MONTH = 60 * 60 * 24 * 30;

const shape = {
  httpOnly: true,
  maxAge: MONTH,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export interface Account {
  handle: string;
  id: string;
  jar: Jar;
}

export const slot = (puuid: string) =>
  createHash("sha256").update(puuid).digest("hex").slice(0, 12);

export const roster = async (): Promise<Account[]> => {
  const store = await cookies();
  const found: Account[] = [];
  for (const item of store.getAll()) {
    if (!item.name.startsWith(PREFIX) || item.name === ACTIVE) {
      continue;
    }
    const raw = unseal(item.value);
    if (!raw) {
      continue;
    }
    try {
      const body = JSON.parse(raw);
      found.push({
        handle: body.handle,
        id: item.name.slice(PREFIX.length),
        jar: body.jar,
      });
    } catch {
      continue;
    }
  }
  return found.toSorted((a, b) => a.handle.localeCompare(b.handle));
};

export const chosen = async () => {
  const all = await roster();
  if (all.length === 0) {
    return null;
  }
  const store = await cookies();
  const id = store.get(ACTIVE)?.value;
  return all.find((entry) => entry.id === id) ?? all[0];
};

export const attach = (
  response: NextResponse,
  account: Account,
  activate = true
) => {
  response.cookies.set(
    `${PREFIX}${account.id}`,
    seal(JSON.stringify({ handle: account.handle, jar: account.jar })),
    shape
  );
  if (activate) {
    response.cookies.set(ACTIVE, account.id, shape);
  }
};

export const activate = (response: NextResponse, id: string) => {
  response.cookies.set(ACTIVE, id, shape);
};

export const forget = (response: NextResponse, id: string) => {
  response.cookies.delete(`${PREFIX}${id}`);
};
