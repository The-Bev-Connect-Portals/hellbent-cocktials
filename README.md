# Hellbent Cocktails — Brand Portal

Co-brand headless storefront for Hellbent Cocktails (hellbentcocktails.com).
Built on the Rincon Brewery reference implementation. Checkout runs through the
Go-To Gifting Shopify store (Type 21 license, seller of record).

**Status: pitch demo. Hellbent is not a signed client.** Keep the Netlify
preview un-indexed until they are.

## Contents

| Path | What it is |
|---|---|
| `hellbent_matrixify_import.csv` | Matrixify products import — 5 SKUs |
| `assets/logo.png` | Hellbent wordmark (237×78, transparent PNG) |

## Import: `hellbent_matrixify_import.csv`

Shopify Admin → Matrixify → Import → Products entity.

5 products, one variant each, $19.95 placeholder, 200 mL cans.

| Setting | Value | Why |
|---|---|---|
| `Vendor` | `Hellbent` | Exact match required for `vendorTag` in `brand.config.js`. A trailing space returns zero products with no error. |
| `Status` | `active` | Draft products are invisible to the Storefront API. |
| `Published` | `FALSE` | Keeps Hellbent **off** the go-togifting.com online store. |
| `Tags Command` | `MERGE` | Non-destructive. `ADD` is invalid and fails every row. |
| `Variant Inventory Tracker` | *(blank)* | Untracked — nothing goes out of stock on the demo. |
| `Image Src` | hellbentcocktails.com CDN | Their own can renders, pulled from the live site. |

Filter-nav tags applied: `vodka`, `tequila`, `gin`, `rum`, plus flavor tags
(`cherry`, `spicy`, `citrus`, `herbal`, `tropical`, `coffee`).

### After importing — required

Products publish to **no** sales channel by default. The Storefront API will
return an empty array until this is done:

1. Products → filter by Vendor = Hellbent → select all 5
2. More actions → Add to sales channel → **Headless** (the storefront created
   for Hellbent)
3. Verify with the curl check in §4.3 of the Brand Portal workflow doc

## Placeholder / to confirm

- **Prices** — $19.95 across the board is a placeholder. Their own site shows
  $34.99 on Rum Reaper (likely a 4-pack); every other price field is empty.
- **Product descriptions** — written for the demo, not Hellbent's own copy.
  Replace with theirs before anything goes to the client as final.
- **Logo** — 237×78 will look soft on retina. Request the source SVG/PNG.
- **Merch** (beanie $23, denim jacket $85, long sleeve $56, tote $17) not
  included. Out of scope for the catalog-browser build.
