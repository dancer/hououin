export type Jar = Record<string, string>;

const WANTED = new Set([
  "__Secure-access_token",
  "__Secure-id_token",
  "__Secure-refresh_token",
  "asid",
  "clid",
  "csid",
  "ssid",
  "sub",
  "tdid",
]);

export const parse = (header: string): Jar => {
  const jar: Jar = {};
  for (const pair of header.split(/;\s*/u)) {
    const index = pair.indexOf("=");
    if (index < 1) {
      continue;
    }
    const name = pair.slice(0, index).trim();
    if (WANTED.has(name)) {
      jar[name] = pair.slice(index + 1);
    }
  }
  return jar;
};

export const absorb = (jar: Jar, headers: Headers): Jar => {
  const next = { ...jar };
  for (const line of headers.getSetCookie()) {
    Object.assign(next, parse(line.split(";")[0] ?? ""));
  }
  return next;
};

export const serialise = (jar: Jar) =>
  Object.entries(jar)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
