import { absorb, parse, serialise } from "@/lib/jar";
import type { Jar } from "@/lib/jar";
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
const SKINS = "e7c63390-eda7-46e0-bb7a-a6abdacd2433";
const TIERS_VP: Record<string, number> = {
  Deluxe: 1275,
  Exclusive: 2175,
  Premium: 1775,
  Select: 875,
  Ultra: 2475,
};
const HOUR = 3_600_000;

export const pasted = (header: string) => parse(header);

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
  jar: Jar;
}

interface Entry {
  colour: string;
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

export const redeem = async (jar: Jar) => {
  const res = await fetch(AUTHORIZE, {
    headers: { cookie: serialise(jar), "user-agent": await agent() },
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

  return {
    jar: absorb(jar, res.headers),
    tokens: { access, id } satisfies Tokens,
  };
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

  const tierName = new Map<string, { colour: string; name: string }>(
    tiers.data.map(
      (tier: { uuid: string; devName: string; highlightColor: string }) => [
        tier.uuid,
        {
          colour: `#${(tier.highlightColor ?? "9b9a9633").slice(0, 6)}`,
          name: tier.devName,
        },
      ]
    )
  );

  const map = new Map<string, Entry>();
  for (const weapon of weapons.data) {
    for (const skin of weapon.skins) {
      const meta = tierName.get(skin.contentTierUuid);
      const entry: Entry = {
        colour: meta?.colour ?? "#9b9a96",
        image: skin.chromas?.[0]?.fullRender ?? skin.displayIcon ?? "",
        name: skin.displayName,
        tier: meta?.name ?? "Standard",
        variants: (skin.chromas ?? [])
          .filter((chroma: { fullRender: string | null }) => chroma.fullRender)
          .map((chroma: { fullRender: string; displayName: string }) => ({
            image: chroma.fullRender,
            name: colour(chroma.displayName),
          })),
        weapon: weapon.displayName,
      };
      map.set(skin.uuid, entry);
      for (const level of skin.levels ?? []) {
        map.set(level.uuid, entry);
      }
      for (const chroma of skin.chromas ?? []) {
        map.set(chroma.uuid, entry);
      }
    }
  }

  catalogue = { at: Date.now(), map };
  return map;
};

export const whoami = async (jar: Jar) => {
  const session = await redeem(jar);
  if (!session) {
    return null;
  }
  const who = await identity(session.tokens);
  return { handle: who.handle, jar: session.jar, puuid: who.puuid };
};

interface Boot {
  ent: string;
  handle: string;
  jar: Jar;
  puuid: string;
  region: string;
  tokens: Tokens;
}

const bootstrap = async (jar: Jar): Promise<Boot | null> => {
  const session = await redeem(jar);
  if (!session) {
    return null;
  }
  const { tokens } = session;
  const [who, ent, region] = await Promise.all([
    identity(tokens),
    entitlement(tokens),
    shard(tokens),
  ]);
  return {
    ent,
    handle: who.handle,
    jar: session.jar,
    puuid: who.puuid,
    region,
    tokens,
  };
};

const call = async (url: string, boot: Boot, init: RequestInit = {}) => {
  const headers = await clientHeaders();
  return await fetch(url, {
    ...init,
    headers: {
      ...bearer(boot.tokens),
      ...headers,
      "Content-Type": "application/json",
      "X-Riot-Entitlements-JWT": boot.ent,
    },
  });
};

export const shop = async (jar: Jar): Promise<Shop | null> => {
  const boot = await bootstrap(jar);
  if (!boot) {
    return null;
  }

  const [res, lookup] = await Promise.all([
    call(
      `https://pd.${boot.region}.a.pvp.net/store/v3/storefront/${boot.puuid}`,
      boot,
      { body: JSON.stringify({}), method: "POST" }
    ),
    levels(),
  ]);

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
        colour: entry?.colour ?? "#9b9a96",
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
    handle: boot.handle,
    jar: boot.jar,
    offers,
    seconds: panel.SingleItemOffersRemainingDurationInSeconds,
  };
};

export interface Collection {
  handle: string;
  jar: Jar;
  skins: Offer[];
}

const worth = (tier: string, weapon: string) => {
  const base = TIERS_VP[tier] ?? 0;
  return weapon === "Melee" ? base * 2 : base;
};

export const collection = async (jar: Jar): Promise<Collection | null> => {
  const boot = await bootstrap(jar);
  if (!boot) {
    return null;
  }

  const [ownedRes, lookup] = await Promise.all([
    call(
      `https://pd.${boot.region}.a.pvp.net/store/v1/entitlements/${boot.puuid}/${SKINS}`,
      boot
    ),
    levels(),
  ]);

  if (!ownedRes.ok) {
    throw new Error(`entitlements ${ownedRes.status}`);
  }

  const owned = await ownedRes.json();
  const entries: { ItemID: string }[] =
    owned.Entitlements ??
    owned.EntitlementsByTypes?.flatMap(
      (group: { Entitlements: { ItemID: string }[] }) => group.Entitlements
    ) ??
    [];

  const seen = new Set<string>();
  const skins: Offer[] = [];
  for (const item of entries) {
    const entry = lookup.get(item.ItemID);
    if (!entry || seen.has(entry.name)) {
      continue;
    }
    seen.add(entry.name);
    skins.push({
      colour: entry.colour,
      image: entry.image,
      name: entry.name,
      price: worth(entry.tier, entry.weapon),
      tier: entry.tier,
      variants: entry.variants,
      weapon: entry.weapon,
    });
  }

  skins.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
  return { handle: boot.handle, jar: boot.jar, skins };
};
