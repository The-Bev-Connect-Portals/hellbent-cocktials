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

  // ── Pre-sale ──────────────────────────────────────────────
  // Set `active: false` the day stock ships and the whole treatment
  // disappears — announcement bar line, notice card, and cart drawer note.
  //
  // `window` is deliberately empty. "Shipping soon" is vague enough to be
  // safe but weak enough to generate support email; replace it with a real
  // window ("Ships the week of Oct 6") as soon as one is confirmed, and it
  // will render everywhere the pre-sale copy appears.
  presale: {
    active: true,
    label: "Pre-Sale Only",
    line: "Shipping soon",
    window: "",
    note: "You're pre-ordering. Your card is charged today and your order " +
          "ships as soon as stock lands \u2014 we're expecting days, not weeks.",
  },

  // ── Minimum order quantity ────────────────────────────────
  //  THE PORTAL DOES NOT ENFORCE THIS. It sets expectations and disables
  //  its own checkout button — but the cart is localStorage and the
  //  Shopify checkout URL is a plain shareable link. Real enforcement is
  //  the Yuko validation function (Shopify Functions) on the store.
  //
  //  ⚠ `scope` MUST match how the Yuko rule is configured, or the site
  //  says one thing and checkout blocks on another:
  //    "cart" → Yuko scope Cart, minimum 2 total items (any mix)
  //    "line" → Yuko scope Product/Variant, minimum 2 of each item
  //
  //  ⚠ The Yuko rule MUST be scoped to Hellbent products only — the
  //  `portal:hellbent` collection. bro-basket.myshopify.com is one store
  //  serving BroBasket and Go-To Gifting too; an unscoped rule puts a
  //  2-item minimum on every gift basket order on the account.
  minOrder: {
    active: true,
    qty: 2,
    scope: "cart",
    // Unit-neutral on purpose. The catalog mixes single cans, 4-packs and
    // boxes, so "2 cans" would be wrong the moment someone adds a 4-pack.
    heading: "2-item minimum",
    line: "Orders start at two items. Mix and match any flavors you like.",
  },

  // ── Launch promo — caution-tape ticker ────────────────────
  // Rendered as a scrolling hazard-tape band under the hero, mirroring the
  // ticker on hellbentcocktails.com. Geometry matched to their real asset
  // (61px band, stripe bands ~15% of height, 45deg lean, ~30px/s) but drawn
  // in CSS from the palette rather than hotlinking their webp — no
  // dependency on their CDN, and it recolors with the brand tokens.
  //
  // Manually switched off once 250 orders are in. Comics are fulfilled
  // separately after the fact — this is copy only, nothing is added to
  // the cart and nothing reaches the Bev Connect pick list.
  //
  // `tickerText` is what scrolls, so keep it short — it repeats. `line` is
  // the full sentence: read once by screen readers, and shown as static
  // text instead of the scroll when the visitor prefers reduced motion.
  promo: {
    active: true,
    tickerText: "First 250 orders get a signed Joe Madureira print",
    line: "First 250 orders will receive a limited-edition HELLBENT print, " +
          "created and signed by Joe Madureira, shipped separately after " +
          "your order.",
  },

  // ── Help widget ───────────────────────────────────────────
  // Floating "?" button, bottom right. Posts to Netlify Forms — no
  // backend. Submissions land in the Netlify dashboard under this form
  // name; set the notification email there (Site configuration → Forms →
  // Form notifications), or nobody sees them.
  helpForm: {
    active: true,
    formName: "hellbent-help",
    heading: "Need a hand?",
    line: "Questions about an order, shipping, or the pre-sale? Send a note " +
          "and we'll get back to you.",
    success: "Thanks — we've got it. We'll reply by email shortly.",
  },

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
  apiVersion:      "2026-04",

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
