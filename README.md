# Hellbent Cocktails — Brand Portal

Co-brand headless storefront for Hellbent Cocktails (hellbentcocktails.com),
built on the Rincon Brewery reference implementation. Checkout runs through the
Go-To Gifting Shopify store — Go-To Gifting holds the Type 21 license and is the
seller of record.

> **Status: pitch demo. Hellbent has not signed anything.**
> The site renders from a hardcoded `demoProducts` array in `brand.config.js`
> and never calls Shopify. `robots.txt` and an `X-Robots-Tag` header keep it out
> of search. Remove both at launch.

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

## Going live — three steps, no code changes

1. Import `hellbent_matrixify_import.csv` via Matrixify, then publish the 5
   products to the Hellbent **Headless** storefront (see below).
2. Paste that storefront's public token into `storefrontToken`.
3. Set `demoProducts: []`.

Everything else — vendor filter, tags, cart, checkout handoff — is already
wired. While `demoProducts` has entries the checkout button says plainly that
it's a preview rather than throwing an error.

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

## Open items

- **Prices** — $19.95 across the board is a placeholder. Their own site shows
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
