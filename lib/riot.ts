import type { Offer, Variant } from "@/lib/offers";

const AUTHORIZE =
  "https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&scope=account%20openid&nonce=1";
const ENTITLEMENTS = "https://entitlements.auth.riotgames.com/api/token/v1";
const USERINFO = "https://auth.riotgames.com/userinfo";
const GEO = "https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant";
const VERSION = "https://valorant-api.com/v1/version";
const WEAPONS = "https://valorant-api.com/v1/weapons";
const TIERS = "https://valorant-api.com/v1/contenttiers";
const VP = "85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741";
const HOUR = 3_600_000;

const PLATFORM = Buffer.from(
  JSON.stringify({
    platformChipset: "Unknown",
    platformOS: "Windows",
    platformOSVersion: "10.0.19042.1.256.64bit",
    platformType: "PC",
  })
).toString("base64");

export interface Tokens {
  access: string;
  id: string;
}

export interface Shop {
  handle: string;
  seconds: number;
  offers: Offer[];
  ssid: string;
}

interface Entry {
  name: string;
  weapon: string;
  tier: string;
  image: string;
  variants: Variant[];
}

let version: { build: string; client: string; at: number } | null = null;
let catalogue: { map: Map<string, Entry>; at: number } | null = null;

const COLOUR = /Variant \d+ (?<name>\w+)/u;

const colour = (label: string) =>
  COLOUR.exec(label.replaceAll("\r\n", " "))?.groups?.name?.toLowerCase() ??
  "base";

const fresh = (at: number) => Date.now() - at < HOUR;

const versions = async () => {
  if (version && fresh(version.at)) {
    return version;
  }
  const res = await fetch(VERSION);
  const body = await res.json();
  version = {
    at: Date.now(),
    build: body.data.riotClientBuild,
    client: body.data.riotClientVersion,
  };
  return version;
};

const agent = async () => {
  const current = await versions();
  return `RiotClient/${current.build}.1234567 rso-auth (Windows;10;;Professional, x64)`;
};

const clientHeaders = async () => {
  const current = await versions();
  return {
    "X-Riot-ClientPlatform": PLATFORM,
    "X-Riot-ClientVersion": current.client,
  };
};

const readCookie = (header: string, name: string) => {
  const found = header
    .split(/;\s*/u)
    .map((pair) => pair.split("="))
    .find(([key]) => key.trim() === name);
  return found?.slice(1).join("=") ?? null;
};

export const extract = (header: string) => readCookie(header, "ssid");

export const redeem = async (ssid: string) => {
  const res = await fetch(AUTHORIZE, {
    headers: { cookie: `ssid=${ssid}`, "user-agent": await agent() },
    redirect: "manual",
  });

  if (res.status === 429) {
    throw new Error("rate limited by riot");
  }

  const location = res.headers.get("location") ?? "";
  const [, hash] = location.split("#");
  if (!hash) {
    return null;
  }

  const parsed = new URLSearchParams(hash);
  const access = parsed.get("access_token");
  const id = parsed.get("id_token");
  if (!(access && id)) {
    return null;
  }

  const rotated =
    readCookie(res.headers.getSetCookie().join("; "), "ssid") ?? ssid;
  return { ssid: rotated, tokens: { access, id } satisfies Tokens };
};

const bearer = (tokens: Tokens) => ({
  Authorization: `Bearer ${tokens.access}`,
});

export const identity = async (tokens: Tokens) => {
  const res = await fetch(USERINFO, { headers: bearer(tokens) });
  const body = await res.json();
  return {
    handle: body.acct ? `${body.acct.game_name}#${body.acct.tag_line}` : "",
    puuid: body.sub as string,
  };
};

export const entitlement = async (tokens: Tokens) => {
  const res = await fetch(ENTITLEMENTS, {
    headers: { ...bearer(tokens), "Content-Type": "application/json" },
    method: "POST",
  });
  const body = await res.json();
  return body.entitlements_token as string;
};

export const shard = async (tokens: Tokens) => {
  const res = await fetch(GEO, {
    body: JSON.stringify({ id_token: tokens.id }),
    headers: { ...bearer(tokens), "Content-Type": "application/json" },
    method: "PUT",
  });
  const body = await res.json();
  return body.affinities.live as string;
};

const levels = async () => {
  if (catalogue && fresh(catalogue.at)) {
    return catalogue.map;
  }

  const [weaponRes, tierRes] = await Promise.all([
    fetch(WEAPONS),
    fetch(TIERS),
  ]);
  const [weapons, tiers] = await Promise.all([
    weaponRes.json(),
    tierRes.json(),
  ]);

  const tierName = new Map<string, string>(
    tiers.data.map((tier: { uuid: string; devName: string }) => [
      tier.uuid,
      tier.devName,
    ])
  );

  const map = new Map<string, Entry>();
  for (const weapon of weapons.data) {
    for (const skin of weapon.skins) {
      const entry: Entry = {
        image: skin.chromas?.[0]?.fullRender ?? skin.displayIcon ?? "",
        name: skin.displayName,
        tier: tierName.get(skin.contentTierUuid) ?? "Standard",
        variants: (skin.chromas ?? [])
          .filter((chroma: { fullRender: string | null }) => chroma.fullRender)
          .map((chroma: { fullRender: string; displayName: string }) => ({
            image: chroma.fullRender,
            name: colour(chroma.displayName),
          })),
        weapon: weapon.displayName,
      };
      for (const level of skin.levels ?? []) {
        map.set(level.uuid, entry);
      }
    }
  }

  catalogue = { at: Date.now(), map };
  return map;
};

export const shop = async (ssid: string): Promise<Shop | null> => {
  const session = await redeem(ssid);
  if (!session) {
    return null;
  }

  const { tokens } = session;
  const [who, ent, region, lookup] = await Promise.all([
    identity(tokens),
    entitlement(tokens),
    shard(tokens),
    levels(),
  ]);

  const res = await fetch(
    `https://pd.${region}.a.pvp.net/store/v3/storefront/${who.puuid}`,
    {
      body: JSON.stringify({}),
      headers: {
        ...bearer(tokens),
        ...(await clientHeaders()),
        "Content-Type": "application/json",
        "X-Riot-Entitlements-JWT": ent,
      },
      method: "POST",
    }
  );

  if (!res.ok) {
    throw new Error(`storefront ${res.status}`);
  }

  const body = await res.json();
  const panel = body.SkinsPanelLayout;

  const offers: Offer[] = panel.SingleItemStoreOffers.map(
    (offer: {
      Cost: Record<string, number>;
      Rewards: { ItemID: string }[];
    }) => {
      const entry = lookup.get(offer.Rewards[0].ItemID);
      return {
        image: entry?.image ?? "",
        name: entry?.name ?? "Unknown",
        price: offer.Cost[VP] ?? 0,
        tier: entry?.tier ?? "Standard",
        variants: entry?.variants ?? [],
        weapon: entry?.weapon ?? "",
      };
    }
  );

  return {
    handle: who.handle,
    offers,
    seconds: panel.SingleItemOffersRemainingDurationInSeconds,
    ssid: session.ssid,
  };
};
