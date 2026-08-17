# Hellbent Cocktails — Brand Portal

Co-brand headless storefront for Hellbent Cocktails (hellbentcocktails.com),
built on the Rincon Brewery reference implementation. Checkout runs through the
Go-To Gifting Shopify store — Go-To Gifting holds the Type 21 license and is the
seller of record.

> **Status: live against Shopify. Hellbent has not signed anything.**
> The catalog is pulled from the Go-To Gifting store via the Storefront API and
> checkout hands off to go-togifting.com for real. It is still a pitch, so
> `robots.txt` and an `X-Robots-Tag` header keep it out of search — remove both
> at launch. Demo mode is still available: put products back into
> `demoProducts` and the portal stops calling Shopify.

Live preview: https://hellbent-cocktails.netlify.app

## Layout

| Path | What it is |
|---|---|
| `index.html` | Single page — masthead, hero, filters, grid, cart drawer |
| `brand.config.js` | **The only file that changes per brand.** Colors, fonts, copy, filters, Shopify creds, demo catalog |
| `assets/app.js` | Catalog fetch, filtering, cart, checkout handoff |
| `assets/styles.css` | All styling; reads CSS custom properties, no hardcoded hex |
| `assets/logo.png` | Hellbent wordmark (237x78) |
| `assets/favicon.png` | Their site icon |
| `hellbent_matrixify_import.csv` | Matrixify products import — 5 SKUs |
| `netlify.toml` | Publish `.`, no build command, security + noindex headers |

## Shopify connection — done

- Products imported and published to the Hellbent Headless storefront.
- `storefrontToken` set to the Hellbent storefront's **public** token. This is
  read-only and scoped to public product data; it is designed to ship in
  client-side JS. Never put an Admin API token here.
- `demoProducts: []`, so the portal queries Shopify.

Verified end to end: 5 products returned, images served from the Shopify CDN,
filters correct, and checkout redirects to a real `go-togifting.com/checkouts/`
session.

## Import: `hellbent_matrixify_import.csv`

Shopify Admin -> Matrixify -> Import -> Products entity.
5 products, one variant each, $19.95 placeholder, 200 mL cans.

| Setting | Value | Why |
|---|---|---|
| `Vendor` | `Hellbent` | Exact match to `vendorTag`. A trailing space returns zero products with no error. |
| `Status` | `active` | Draft products are invisible to the Storefront API. |
| `Published` | `FALSE` | Keeps Hellbent **off** the go-togifting.com online store. |
| `Tags Command` | `MERGE` | Non-destructive. `ADD` is invalid and fails every row. |
| `Variant Inventory Tracker` | *(blank)* | Untracked — nothing goes out of stock on the demo. |
| `Image Src` | hellbentcocktails.com CDN | Their own can renders; move to Shopify CDN on import. |

**After importing:** products publish to no sales channel by default. The
Storefront API returns an empty array until you select all 5 -> More actions ->
Add to sales channel -> Headless.

## Brand identity — extracted, not invented

Pulled from `hellbentcocktails.com/wp-content/themes/hellbent/style.css`:

- **`#B62126`** red (13 uses) and **`#FBAE24`** amber (8 uses) are their two
  brand colors; page ground is `#000` / `#1F1F1F`. The hot pink on their
  homepage is part of the hero artwork, not the theme.
- Their real faces are **DoubleTracker** (display) and **Trade Gothic LT Pro**
  (body) — both licensed and self-hosted on their server. We don't hold that
  license, so Oswald and Barlow stand in. Swap in the real files if they sign
  and supply them.

## Pre-sale, minimum order, promo

All three are config blocks in `brand.config.js` and all three switch off by
flipping one `active` flag — no markup changes.

| Block | Turns off when | What disappears |
|---|---|---|
| `presale` | Stock ships | Announcement-bar flag, notice card, cart drawer note |
| `minOrder` | Minimum is dropped | Notice card, cart gate, checkout block |
| `promo` | 250th order is in | Caution-tape ticker band |

`presale.window` is empty. "Shipping soon" is vague enough to be safe but
weak enough to generate support email — put a real window in
(`"Ships the week of Oct 6"`) as soon as one is confirmed and it renders
everywhere the pre-sale copy appears.

The comic book is copy only. Nothing is added to the cart, no `$0` SKU is
created, and nothing reaches a Bev Connect pick list — comics are fulfilled
separately after the fact and the flag is switched off by hand at 250.

### The caution-tape ticker

The promo renders as a scrolling hazard-tape band under the hero, mirroring
the ticker on hellbentcocktails.com. Their real band was measured and matched:

| | Theirs | Ours |
|---|---|---|
| Band height | 61px | 61px (44px under 680px) |
| Stripe bands | ~15% of height, top and bottom | same |
| Stripe lean | 45deg | same |
| Type | 32px uppercase, `line-height: 86%`, 20px span margin | same |
| Speed | 2728px track, -1364px over 45s = ~30px/s | 30px/s, measured |

Two deliberate differences:

**The tape is drawn in CSS, not their image.** Their band is a hosted webp
(`ticker-blank-scaled.webp`). Reproducing it with `repeating-linear-gradient`
off `--accent` / `--accent-text` means no dependency on their CDN, nothing of
theirs committed here, and it recolors automatically if the palette changes.

**The speed is derived, not hardcoded.** `paintTape()` builds a half wide
enough to cover the viewport, clones it, and sets the duration from the
measured width so ~30px/s holds regardless of how long `tickerText` is.
Change the copy and the cadence stays right.

Type is Oswald, not their licensed `doubletracker` — same substitution noted
for the rest of the portal.

**Motion.** WCAG 2.2.2 wants a way to stop content that moves for more than
five seconds, so the band pauses on hover, pauses on keyboard focus, and has
a pause/play control. Under `prefers-reduced-motion` the scroll is dropped
entirely for a static centred line, which is why `promo.line` carries the
full sentence while `promo.tickerText` carries the short repeating one.
Screen readers read `promo.line` once; the scrolling copies are
`aria-hidden`. Their site does none of this.

### The minimum is NOT enforced by this repo

`minOrder` sets expectations and disables this site's own checkout button.
That is all it can do. The cart is `localStorage` and the Shopify
`checkoutUrl` is a plain shareable link, so anything decided in the browser
can be walked around.

Enforcement is the **Yuko** validation function on
`bro-basket.myshopify.com`, which runs server-side via Shopify Functions and
cannot be bypassed — including by Shop Pay and the other express buttons.
Two things must be true of that rule:

1. **Scope it to Hellbent products only** — the `portal:hellbent` collection.
   `bro-basket.myshopify.com` is one store also serving BroBasket and Go-To
   Gifting. An unscoped rule puts a 2-item minimum on every gift basket
   order on the account.
2. **Match `minOrder.scope`.** `"cart"` here means Yuko scope *Cart*,
   minimum 2 total items. `"line"` means scope *Product/Variant*, minimum 2
   of each. If the two disagree the site promises one rule and checkout
   blocks on another.

Neither can be verified from this repo. Place a test order after configuring
Yuko and confirm a 1-item cart is actually rejected at Shopify's checkout,
not just here.

## Help widget

Floating `?`, bottom right → panel → **Netlify Forms**. No backend, no
third-party script, no cookies. `thanks.html` is the no-JS fallback; with JS
the panel posts over `fetch` and shows success inline.

**The form markup must stay in `index.html`.** Netlify registers forms by
parsing deployed HTML at build time. A form injected by `app.js` is never
registered and every submission 404s.

⚠ **Submissions go nowhere until a notification is configured.** They collect
in Netlify → Site configuration → Forms → *Form notifications*. Set the
reply-to address there. Same trap that is still open on `the_Rock_Slo`.

## Open items

- **Prices** — $19.95 across the board is a placeholder, now live in Shopify. Their own site shows
  $34.99 on Rum Reaper (likely a 4-pack); every other price field is empty.
- **Descriptions** — written for the demo, not Hellbent's copy. Replace before
  this is treated as final.
- **Logo** — 237x78 will soften on retina. Request the source SVG/PNG.
- **Merch** (beanie $23, denim jacket $85, long sleeve $56, tote $17) is out of
  scope; this is a catalog browser plus a cart handoff, per the scope guard.
- **Compliance** — attorney-confirmed destination-state list is still pending.
  The announcement bar says shipping is confirmed at checkout and names no
  states. Destination screening and age verification live in Shopify checkout.

## Divergence from the Rincon reference

`assets/app.js` gained six small brand-agnostic changes that should be
backported to `Rincon_brewery` so the two stay in sync:

1. Demo-catalog mode (`BRAND.demoProducts`)
2. `description` carried through from the Storefront API
3. Description rendered on the product card (`.card__note`)
4. `shortTitle` also strips a bare `"Brand "` prefix, not just `"Brand - "`
5. Checkout states plainly that it's a preview in demo mode
6. Blank `supportPhone` falls back to the support email in error text
7. `descriptionHtml` split into a lead paragraph (`.card__note`) and a spec
   line (`.card__spec`) built from the description's `<li>` items
8. Add to cart opens the cart drawer
9. `BRAND.nav` — config-driven header nav; external links open in a new tab
10. The logo links to `backToSiteUrl` instead of `/`, with an explicit
    aria-label since that isn't where a logo normally goes
11. Removed the mobile rule that collapsed `.masthead__link` into a round ↗
    icon — fine for one back-link, but it hid three named nav labels
12. Failure state no longer says "beer list" and no longer renders an empty
    `tel:` link when `supportPhone` is blank
