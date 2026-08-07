// ─────────────────────────────────────────────────────────────
//  BRAND CONFIG — the only file that changes to onboard a brand.
//
//  Hellbent Cocktails — PITCH DEMO.
//  Hellbent is not a signed client. This runs off `demoProducts`
//  below, not Shopify. To go live see "GOING LIVE" at the bottom.
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  // ── Identity ──────────────────────────────────────────────
  name: "Hellbent",
  vendorTag: "Hellbent",           // MUST match Shopify `vendor` exactly
  logo: "/assets/logo.png",

  // Hero wordmark. Replaces the word "Hellbent" in the H1 with the logo image.
  // Their team's bare logotype cut — white on transparent, no tagline lockup,
  // so it sits inline with "Shop" at matching optical weight.
  heroMark: "/assets/wordmark.png",

  // Product claim badge in the hero. Their supplied artwork, used as-is —
  // it's designed black-on-white and reads as a printed stamp on the dark page.
  heroBadge: {
    image: "/assets/two-cocktails-badge.png",
    label: "Two cocktails per can",
  },
  logoIncludesName: true,          // wordmark already reads "HELLBENT"
  favicon: "/assets/favicon.png",

  // ── Look ──────────────────────────────────────────────────
  // Extracted from hellbentcocktails.com/wp-content/themes/hellbent/style.css
  // — not invented. #b62126 (13 uses) and #fbae24 (8) are their two
  // brand colors; the site ground is #000/#1f1f1f.
  colors: {
    bg:         "#0A0A0A",   // near-black — their page ground
    surface:    "#151515",   // cards
    surfaceAlt: "#1F1F1F",   // hover / raised (theirs)
    text:       "#FFFFFF",
    muted:      "#9C9C9C",
    line:       "#2C2C2C",
    accent:     "#FBAE24",   // Hellbent amber — their button color
    accentText: "#0A0A0A",   // black on amber, as on their site
    gold:       "#B62126",   // Hellbent red — badges / highlight
  },

  // Their real faces are DoubleTracker (display) and Trade Gothic LT Pro
  // (body). Both are licensed and self-hosted on their server — we do not
  // have the license, so these are the closest free stand-ins. Swap in the
  // real files if Hellbent signs and supplies them.
  fonts: {
    display: "'Oswald', 'Helvetica Neue', sans-serif",
    body:    "'Barlow', system-ui, sans-serif",
    googleFontsHref:
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@400;500;600;700&display=swap",
  },

  // ── Copy ──────────────────────────────────────────────────
  tagline: "Ready-to-drink cocktails with a wicked twist, shipped to your door.",
  heroKicker: "Cocktails \u00b7 Evil Spirits",

  // The logo links here — on our domain it's the only thread back to the brand.
  backToSiteUrl: "https://www.hellbentcocktails.com",
  backToSiteLabel: "Back to Main Site",

  // Header nav, mirroring hellbentcocktails.com. "Pick Your Poison" is their
  // cocktails page; here it IS the shop, so it points at the grid. Merch and
  // About Us have no portal equivalent and link out to their site.
  nav: [
    { label: "Pick Your Poison", href: "#grid" },
    { label: "Merch",    href: "https://www.hellbentcocktails.com/merch/",    external: true },
    { label: "About Us", href: "https://www.hellbentcocktails.com/about-us/", external: true },
  ],

  // Announcement bar. Display only — never the enforcement layer.
  // Real state list is attorney-pending. Do not name states here.
  shippingLine: "Shipping to select states. Enter your address at checkout to confirm.",

  // Shown if the catalog fails to load. Go-To Gifting is the seller of
  // record; Hellbent publishes no public contact details.
  supportEmail: "james@gotogifting.com",
  supportPhone: "",

  // ── Filters ───────────────────────────────────────────────
  // Match the tags actually on the products (see the Matrixify CSV).
  filters: [
    { label: "All Cocktails", tag: null },
    { label: "Vodka",         tag: "vodka" },
    { label: "Tequila",       tag: "tequila" },
    { label: "Gin",           tag: "gin" },
    { label: "Rum",           tag: "rum" },
    { label: "Coffee",        tag: "coffee" },
  ],

  // ── Shopify ───────────────────────────────────────────────
  // Public Storefront token. Safe to ship client-side: read-only,
  // scoped to public product data. NEVER put an Admin token here.
  shopDomain:      "bro-basket.myshopify.com",
  storefrontToken: "9a66fb83a2b5039a596997d1f574aafe",  // Hellbent Headless storefront
  apiVersion:      "2025-01",

  sourceTag: "hellbent-portal",

  // Seller of record. Legally operative — do not soften.
  sellerOfRecord: "Go-To Gifting",
  sellerNote:
    "Checkout is handled by Go-To Gifting, our licensed retail partner.",

  // ── DEMO MODE ─────────────────────────────────────────────
  //  While `demoProducts` is a non-empty array the portal renders from it
  //  and never calls Shopify. Checkout is disabled and says so plainly —
  //  it does not pretend to work.
  //
  //  GOING LIVE (three steps, no other file changes):
  //    1. Import hellbent_matrixify_import.csv; publish the 5 products to
  //       the Hellbent Headless storefront.
  //    2. Paste that storefront's public token into `storefrontToken`.
  //    3. Set `demoProducts: []`.
  //
  //  Prices are $19.95 placeholders. Images are Hellbent's own can
  //  renders, hotlinked from their CDN for the demo only — they move to
  //  Shopify CDN on import.
  demoProducts: [],
};
