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

> how exact is this?

  today's four offers carry the price riot charges you, read
  straight from the storefront.

  everywhere else the number is riot's list price for that skin's
  content tier: select 875, deluxe 1275, premium 1775, exclusive
  2175, ultra 2475, doubled for melee. riot deleted the endpoint
  that priced the whole catalogue, and every path it lived at now
  answers resource_not_found while wallet and entitlements still
  work, so it is gone rather than moved. tier pricing is the rule
  riot prices by, so it is right for anything the shop sells.
  items only ever sold inside a bundle never had a price of their
  own, so theirs is notional.

  skin art is riot's own render at 512px. that is the largest they
  publish, there is no larger variant, and nothing here is ever
  drawn above it.

> license?

  the code is mit. take it, change it, ship it.

  that covers the code and nothing else. valorant, the skin names,
  and every render under public/skins belong to riot. this is a fan
  project, not affiliated with or endorsed by riot games.

> links?

  https://hououin.com
  https://github.com/dancer/hououin
```
