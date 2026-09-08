```bash
> hououin?

  your valorant store and locker, in a browser tab.
  no client. no password. no install.

> features?

  ✓ today's four offers with the prices riot actually charges
  ✓ the real reset countdown, per account, not a guess at midnight
  ✓ inspect any skin at native resolution, with every chroma
  ✓ your whole locker, sorted by what it is worth
  ✓ export the lot as one png worth posting
  ✓ hold several accounts and switch without signing in again
  ✓ sign in by scanning a code with riot mobile

> run?

  git clone https://github.com/dancer/hououin.git
  cd hououin
  bun install
  echo "SESSION_SECRET=$(openssl rand -hex 32)" > .env.local
  bun dev

> sign in?

  open the site, press connect, scan the code with riot mobile.
  your password is never typed into this app and never seen by it.

  no phone to hand? paste the cookie header from auth.riotgames.com
  instead. same result, more clicks.

> where does my session live?

  riot gives back a session cookie. it is sealed with aes-256-gcm
  and stored only in your browser, one httponly cookie per account.
  no database, nothing on disk, nothing shared between people.

  it is not sealed from the server, though. every request sends the
  sealed cookie back, the server decrypts it in memory to call riot
  on your behalf, and forgets it. so: stored in your browser,
  processed on the server, only ever sent onward to riot. logging
  out deletes it. read the code before you trust it with an account.

> is this allowed?

  no. riot's valorant developer policy lists online store tracking
  as an unapproved use case, because the official api has no
  endpoint for it. rso, riot's login, has no scope for a store or a
  locker either. this talks to the internal endpoints the game
  client uses, like every other store checker.

  no one is known to have been banned for reading their own store,
  and riot has left these tools alone for years. that is a pattern,
  not a permission. riot can change the endpoints or their mind at
  any time, and both would break this.

> anything inaccurate?

  prices outside today's store are worked out from content tier,
  because riot removed the offers endpoint. they are labelled as
  estimates, and bundle exclusives like champions skins read low.

  skin art comes from valorant-api.com at 512px, the largest riot
  publishes. nothing is ever drawn above its native size.

> stack?

  next 16, react 19, tailwind 4, ultracite with oxlint and oxfmt.
  no database. no analytics. no asset host but riot's.

> links?

  https://hououin.com
  https://github.com/dancer/hououin
```
