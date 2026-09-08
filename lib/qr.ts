import { randomUUID } from "node:crypto";

import { absorb, serialise } from "@/lib/jar";
import type { Jar } from "@/lib/jar";

const DISCOVERY = "https://auth.riotgames.com/.well-known/openid-configuration";
const LOGIN = "https://authenticate.riotgames.com/api/v1/login";
const REDEEM = "https://auth.riotgames.com/api/v1/login-token";
const AUTHORIZE = "https://auth.riotgames.com/api/v1/authorization";
const QR = "https://qrlogin.riotgames.com/riotmobile/";
const CLIENT =
  "RiotGamesApi/24.9.1.4445 rso-auth (Windows;10;;Professional, x64) riot_client/0";
const AUTHENTICATOR =
  "RiotGamesApi/24.9.1.4445 rso-authenticator (Windows;10;;Professional, x64) riot_client/0";

export interface Pending {
  jar: Jar;
  sdk: string;
  url: string;
}

const trace = () =>
  `00-${randomUUID().replaceAll("-", "")}-${randomUUID().replaceAll("-", "").slice(0, 16)}-00`;

const common = (sdk: string, country: string, agent: string) => ({
  Accept: "application/json",
  baggage: `sdksid=${sdk}`,
  "country-code": country,
  traceparent: trace(),
  "user-agent": agent,
});

export const start = async (country: string): Promise<Pending | null> => {
  const sdk = randomUUID();
  let jar: Jar = {};

  const warm = await fetch(DISCOVERY, {
    headers: common(sdk, country, CLIENT),
  });
  jar = absorb(jar, warm.headers);

  const res = await fetch(LOGIN, {
    body: JSON.stringify({
      client_id: "riot-client",
      language: "en_GB",
      platform: "windows",
      qrcode: {},
      remember: true,
      type: "auth",
    }),
    headers: {
      ...common(sdk, country, AUTHENTICATOR),
      "Content-Type": "application/json",
      cookie: serialise(jar),
    },
    method: "POST",
  });

  if (!res.ok) {
    return null;
  }

  jar = absorb(jar, res.headers);
  const body = await res.json();
  if (!(body.cluster && body.suuid && body.timestamp)) {
    return null;
  }

  const url = `${QR}?cluster=${body.cluster}&suuid=${body.suuid}&timestamp=${body.timestamp}&utm_source=riotclient&utm_medium=client&utm_campaign=qrlogin-riotmobile`;
  return { jar, sdk, url };
};

export const poll = async (pending: Pending, country: string) => {
  const check = await fetch(LOGIN, {
    headers: {
      ...common(pending.sdk, country, AUTHENTICATOR),
      cookie: serialise(pending.jar),
    },
  });

  if (!check.ok) {
    return { status: "waiting" as const };
  }

  let jar = absorb(pending.jar, check.headers);
  const body = await check.json();
  const token = body?.success?.login_token;
  if (!token) {
    return {
      stage: String(body?.type ?? "unknown"),
      status: "waiting" as const,
    };
  }

  const swap = await fetch(REDEEM, {
    body: JSON.stringify({
      authentication_type: null,
      code_verifier: "",
      login_token: token,
      persist_login: true,
    }),
    headers: {
      ...common(pending.sdk, country, CLIENT),
      "Content-Type": "application/json",
      cookie: serialise(jar),
    },
    method: "POST",
  });

  if (swap.status !== 204) {
    return { status: "failed" as const };
  }
  jar = absorb(jar, swap.headers);

  const grant = await fetch(AUTHORIZE, {
    body: JSON.stringify({
      acr_values: "",
      claims: "",
      client_id: "riot-client",
      code_challenge: "",
      code_challenge_method: "",
      nonce: randomUUID(),
      redirect_uri: "http://localhost/redirect",
      response_type: "token id_token",
      scope: "openid link ban lol_region account",
    }),
    headers: {
      ...common(pending.sdk, country, CLIENT),
      "Content-Type": "application/json",
      cookie: serialise(jar),
    },
    method: "POST",
  });

  if (!grant.ok) {
    return { status: "failed" as const };
  }

  jar = absorb(jar, grant.headers);
  if (!jar.ssid) {
    return { status: "failed" as const };
  }

  return { jar, status: "done" as const };
};
