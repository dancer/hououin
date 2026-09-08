export type Jar = Record<string, string>;

export const parse = (header: string): Jar => {
  const jar: Jar = {};
  for (const pair of header.split(/;\s*/u)) {
    const index = pair.indexOf("=");
    if (index < 1) {
      continue;
    }
    jar[pair.slice(0, index).trim()] = pair.slice(index + 1);
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
