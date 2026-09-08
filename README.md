```bash
> hououin?

  your valorant store and locker, in a browser tab.
  no client. no password. no install.

> features?

  ✓ today's four offers with real prices, straight from riot
  ✓ the real reset countdown, per account, not a guess at midnight
  ✓ inspect any skin at full resolution, with every chroma
  ✓ your whole collection, sorted by what it cost
  ✓ export the lot as one png worth posting
  ✓ hold several accounts and switch without signing in again
  ✓ sign in by scanning a code with riot mobile
  ✓ sessions are encrypted and never leave your browser

> run?

  git clone https://github.com/dancer/hououin.git
  cd hououin
  bun install
  echo "SESSION_SECRET=$(openssl rand -hex 32)" > .env.local
  bun dev

> sign in?

  open the site, press connect, scan the code with riot mobile.
  your password never touches this app, or any machine but riot's.

  no phone to hand? paste the cookie header from auth.riotgames.com
  instead. same result, more clicks.

> heads up?

  riot has no public api for any of this. the official developer
  api gives you match history and server status. rso, its login,
  has no scope for a store or a locker. every store checker that
  exists talks to the internal endpoints the game client uses, and
  so does this one.

  that makes your riot session cookie the key to the whole thing.
  it is sealed with aes-256-gcm and kept in an httponly cookie in
  your browser, one per account. nothing is written down on any
  server, it is only ever sent back to riot, and logging out
  deletes it. read the code before you trust it with an account.

  riot has never banned anyone for reading their own store, and a
  riot developer has said so in public. tolerated, not permitted.

  skin renders come from valorant-api.com at 512px, the largest
  riot publishes. anything bigger would be upscaling, so nothing
  here is ever drawn above its native size.

  prices outside today's store are derived from content tier,
  because riot removed the offers endpoint. bundle exclusives like
  champions skins will read low.

> stack?

  next 16, react 19, tailwind 4, ultracite with oxlint and oxfmt.
  no database. no analytics. no third party asset host but riot's.

> links?

  https://hououin.com
  https://github.com/dancer/hououin
```
