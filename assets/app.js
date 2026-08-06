import { BRAND } from "../brand.config.js";

/* ═══════════════════════════════════════════════════════════
   Boot: theme tokens, fonts, document chrome
   ═══════════════════════════════════════════════════════════ */

const root = document.documentElement;
const C = BRAND.colors;
root.style.setProperty("--bg", C.bg);
root.style.setProperty("--surface", C.surface);
root.style.setProperty("--surface-alt", C.surfaceAlt);
root.style.setProperty("--text", C.text);
root.style.setProperty("--muted", C.muted);
root.style.setProperty("--line", C.line);
root.style.setProperty("--accent", C.accent);
root.style.setProperty("--accent-text", C.accentText);
root.style.setProperty("--gold", C.gold);
root.style.setProperty("--font-display", BRAND.fonts.display);
root.style.setProperty("--font-body", BRAND.fonts.body);

function link(rel, href, extra = {}) {
  const el = document.createElement("link");
  el.rel = rel; el.href = href;
  Object.assign(el, extra);
  document.head.appendChild(el);
}
link("stylesheet", BRAND.fonts.googleFontsHref);
if (BRAND.favicon) link("icon", BRAND.favicon);

document.title = `Shop ${BRAND.name}`;

/* ═══════════════════════════════════════════════════════════
   Storefront API
   ═══════════════════════════════════════════════════════════ */

const ENDPOINT = `https://${BRAND.shopDomain}/api/${BRAND.apiVersion}/graphql.json`;
const CACHE_KEY = `catalog:${BRAND.vendorTag}`;
const CACHE_TTL = 5 * 60 * 1000;

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": BRAND.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Storefront API returned ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message || "Query failed");
  return json.data;
}

const CATALOG_QUERY = `
  query Catalog($q: String!) {
    products(first: 100, query: $q) {
      edges { node {
        id title handle description descriptionHtml tags availableForSale
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 10) { edges { node {
          id title availableForSale
          price { amount currencyCode }
        }}}
      }}
    }
  }`;

// Demo mode: while BRAND.demoProducts is a non-empty array the portal
// renders from it and never calls Shopify. Used for pitch previews before
// the client's products exist in the store. Set it to [] to go live.
const DEMO = Array.isArray(BRAND.demoProducts) && BRAND.demoProducts.length > 0;

function demoCatalog() {
  return BRAND.demoProducts.map((p) => ({
    ...p,
    variants: [{
      id: `${p.id}-variant`,
      title: "Default Title",
      inStock: p.inStock !== false,
      price: p.price,
    }],
  }));
}

function splitDescription(html, fallback) {
  if (!html) return { description: fallback || "", specs: [] };
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const lead = doc.querySelector("p")?.textContent?.trim();
    const specs = [...doc.querySelectorAll("li")]
      .map((li) => li.textContent.trim()).filter(Boolean);
    return { description: lead || fallback || "", specs };
  } catch {
    return { description: fallback || "", specs: [] };
  }
}

async function loadCatalog() {
  if (DEMO) return demoCatalog();

  try {
    const hit = sessionStorage.getItem(CACHE_KEY);
    if (hit) {
      const { at, data } = JSON.parse(hit);
      if (Date.now() - at < CACHE_TTL) return data;
    }
  } catch { /* cache is best-effort */ }

  const data = await gql(CATALOG_QUERY, { q: `vendor:'${BRAND.vendorTag}'` });
  const products = data.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    tags: node.tags || [],
    ...splitDescription(node.descriptionHtml, node.description),
    inStock: node.availableForSale,
    image: node.featuredImage?.url || null,
    alt: node.featuredImage?.altText || node.title,
    price: node.priceRange.minVariantPrice,
    variants: node.variants.edges.map((v) => ({
      id: v.node.id,
      title: v.node.title,
      inStock: v.node.availableForSale,
      price: v.node.price,
    })),
  }));

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: products }));
  } catch { /* quota — non-fatal */ }

  return products;
}

/* ═══════════════════════════════════════════════════════════
   Cart — localStorage, keyed per brand so two portals open in
   one browser never collide.
   ═══════════════════════════════════════════════════════════ */

const CART_KEY = `cart:${BRAND.sourceTag}`;
let cart = [];

try {
  cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  if (!Array.isArray(cart)) cart = [];
} catch { cart = []; }

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
  renderCartButton();
  renderCart();
}

function addToCart(product) {
  const variant = product.variants.find((v) => v.inStock) || product.variants[0];
  if (!variant) return;
  const existing = cart.find((l) => l.variantId === variant.id);
  if (existing) existing.qty += 1;
  else cart.push({
    variantId: variant.id,
    title: product.title,
    variantTitle: variant.title === "Default Title" ? null : variant.title,
    price: variant.price.amount,
    currency: variant.price.currencyCode,
    image: product.image,
    qty: 1,
  });
  saveCart();
}

function setQty(variantId, qty) {
  const line = cart.find((l) => l.variantId === variantId);
  if (!line) return;
  line.qty = qty;
  if (line.qty < 1) cart = cart.filter((l) => l.variantId !== variantId);
  saveCart();
}

const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
const cartTotal = () => cart.reduce((n, l) => n + Number(l.price) * l.qty, 0);

const money = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount));

/* ═══════════════════════════════════════════════════════════
   Render
   ═══════════════════════════════════════════════════════════ */

const $ = (sel) => document.querySelector(sel);
let allProducts = [];
let activeFilter = null;

// Derive a display style label from the product's tags.
const STYLE_TAGS = BRAND.filters.filter((f) => f.tag).map((f) => f.tag);
function styleLabel(product) {
  const match = STYLE_TAGS.find((t) => product.tags.includes(t));
  if (!match) return "";
  return BRAND.filters.find((f) => f.tag === match)?.label || "";
}

function matchesFilter(product) {
  return !activeFilter || product.tags.includes(activeFilter);
}

function renderFilters() {
  const list = $("#filters");
  list.innerHTML = "";
  for (const f of BRAND.filters) {
    const count = f.tag
      ? allProducts.filter((p) => p.tags.includes(f.tag)).length
      : allProducts.length;
    if (f.tag && count === 0) continue;   // hide filters with nothing behind them

    const li = document.createElement("li");
    li.className = "filters__item";
    const btn = document.createElement("button");
    btn.className = "filters__btn";
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(activeFilter === f.tag));
    btn.innerHTML = `<span>${f.label}</span><span class="filters__count">${count}</span>`;
    btn.addEventListener("click", () => {
      activeFilter = f.tag;
      renderFilters();
      renderGrid();
    });
    li.appendChild(btn);
    list.appendChild(li);
  }
}

function renderGrid() {
  const grid = $("#grid");
  const shown = allProducts.filter(matchesFilter);

  if (!shown.length) {
    grid.innerHTML = "";
    grid.className = "";
    grid.innerHTML = `<div class="state">
      <h2 class="state__title">Nothing here yet</h2>
      <p>No beer matches that filter right now. Try another style.</p>
    </div>`;
    return;
  }

  grid.className = "grid";
  grid.innerHTML = "";

  for (const p of shown) {
    const card = document.createElement("article");
    card.className = "card" + (p.inStock ? "" : " card--out");

    const style = styleLabel(p);
    const limited = p.tags.includes("limited-release");

    card.innerHTML = `
      <div class="card__media">
        ${p.image
          ? `<img src="${p.image}" alt="${escapeAttr(p.alt)}" loading="lazy" width="600" height="600">`
          : ""}
        ${!p.inStock ? `<span class="card__flag card__flag--out">Sold out</span>`
          : limited ? `<span class="card__flag">Limited</span>` : ""}
      </div>
      <div class="card__body">
        ${style ? `<span class="card__style">${style}</span>` : ""}
        <h3 class="card__title">${escapeHtml(shortTitle(p.title))}</h3>
        ${p.description ? `<p class="card__note">${escapeHtml(p.description)}</p>` : ""}
        ${p.specs?.length ? `<p class="card__spec">${escapeHtml(p.specs.join(" \u00b7 "))}</p>` : ""}
        <div class="card__foot">
          <span class="card__price">${money(p.price.amount, p.price.currencyCode)}</span>
        </div>
      </div>`;

    const btn = document.createElement("button");
    btn.className = "add-btn";
    btn.type = "button";
    btn.textContent = p.inStock ? "Add" : "Sold out";
    btn.disabled = !p.inStock;
    if (p.inStock) {
      btn.addEventListener("click", () => {
        addToCart(p);
        openDrawer();
      });
    }
    card.querySelector(".card__foot").appendChild(btn);
    grid.appendChild(card);
  }
}

// Products are named "Rincon Brewery - Beached Hazy IPA"; the brand
// prefix is redundant on the brand's own storefront.
function shortTitle(title) {
  for (const prefix of [`${BRAND.name} - `, `${BRAND.name} `]) {
    if (title.startsWith(prefix)) return title.slice(prefix.length);
  }
  return title;
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const escapeAttr = escapeHtml;

function renderCartButton() {
  const n = cartCount();
  const badge = $("#cart-count");
  badge.textContent = n;
  badge.hidden = n === 0;
}

function renderCart() {
  const body = $("#drawer-body");
  const foot = $("#drawer-foot");

  if (!cart.length) {
    body.innerHTML = `<div class="drawer__empty">
      <p>Your cart is empty.</p>
      <p style="font-size:0.8rem">Pick something cold and it'll show up here.</p>
    </div>`;
    foot.hidden = true;
    return;
  }

  foot.hidden = false;
  body.innerHTML = "";

  for (const line of cart) {
    const el = document.createElement("div");
    el.className = "line";
    el.innerHTML = `
      ${line.image ? `<img class="line__img" src="${line.image}" alt="" loading="lazy">`
                   : `<div class="line__img"></div>`}
      <div class="line__main">
        <p class="line__name">${escapeHtml(shortTitle(line.title))}</p>
        ${line.variantTitle ? `<p class="line__variant">${escapeHtml(line.variantTitle)}</p>` : ""}
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
          <span class="stepper">
            <button type="button" aria-label="Decrease quantity">−</button>
            <output>${line.qty}</output>
            <button type="button" aria-label="Increase quantity">+</button>
          </span>
          <span class="line__price">${money(Number(line.price) * line.qty, line.currency)}</span>
        </div>
        <button class="line__remove" type="button">Remove</button>
      </div>`;

    const [minus, plus] = el.querySelectorAll(".stepper button");
    minus.addEventListener("click", () => setQty(line.variantId, line.qty - 1));
    plus.addEventListener("click", () => setQty(line.variantId, line.qty + 1));
    el.querySelector(".line__remove")
      .addEventListener("click", () => setQty(line.variantId, 0));

    body.appendChild(el);
  }

  $("#cart-total").textContent = money(cartTotal(), cart[0].currency);
}

/* ═══════════════════════════════════════════════════════════
   Drawer + focus management
   ═══════════════════════════════════════════════════════════ */

let lastFocus = null;

function openDrawer() {
  lastFocus = document.activeElement;
  $("#drawer").dataset.open = "true";
  $("#scrim").dataset.open = "true";
  $("#drawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#drawer-close").focus();
  document.addEventListener("keydown", onDrawerKey);
}

function closeDrawer() {
  $("#drawer").dataset.open = "false";
  $("#scrim").dataset.open = "false";
  $("#drawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.removeEventListener("keydown", onDrawerKey);
  lastFocus?.focus();
}

function onDrawerKey(e) {
  if (e.key === "Escape") { closeDrawer(); return; }
  if (e.key !== "Tab") return;
  const focusables = $("#drawer").querySelectorAll(
    'button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ═══════════════════════════════════════════════════════════
   Checkout handoff

   The cart is built in Shopify at checkout time, not on every
   add — fewer API calls, simpler local state. The customer then
   leaves for Shopify's domain, where Go-To Gifting is the seller
   of record. Destination-state screening and age verification
   live THERE, not here. See COMPLIANCE in the README.
   ═══════════════════════════════════════════════════════════ */

const CART_CREATE = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }`;

async function checkout() {
  const btn = $("#checkout");
  const errBox = $("#drawer-error");
  errBox.hidden = true;

  // Demo mode has no Shopify cart behind it. Say so rather than throwing a
  // stack trace or spinning forever.
  if (DEMO) {
    errBox.textContent =
      "This is a preview. Checkout goes live once the catalog is connected to Shopify.";
    errBox.hidden = false;
    return;
  }

  btn.disabled = true;
  btn.textContent = "Preparing checkout…";

  try {
    const data = await gql(CART_CREATE, {
      input: {
        lines: cart.map((l) => ({ merchandiseId: l.variantId, quantity: l.qty })),
        attributes: [{ key: "source", value: BRAND.sourceTag }],
        note: `Order placed via the ${BRAND.name} portal.`,
      },
    });

    const result = data.cartCreate;
    if (result.userErrors?.length) throw new Error(result.userErrors[0].message);
    const url = result.cart?.checkoutUrl;
    if (!url) throw new Error("No checkout URL returned.");

    window.location.href = url;
  } catch (err) {
    const reach = BRAND.supportPhone
      ? `call us at ${BRAND.supportPhone}`
      : `email ${BRAND.supportEmail}`;
    errBox.textContent = `Couldn't start checkout: ${err.message} Try again, or ${reach}.`;
    errBox.hidden = false;
    btn.disabled = false;
    btn.textContent = "Checkout";
  }
}

/* ═══════════════════════════════════════════════════════════
   Init
   ═══════════════════════════════════════════════════════════ */

function paintStaticCopy() {
  $("#announce").textContent = BRAND.shippingLine;
  const nameEl = $("#brand-name");
  if (BRAND.logo && BRAND.logoIncludesName) {
    nameEl.className = "visually-hidden";   // keep for screen readers
  }
  nameEl.textContent = BRAND.name;
  $("#hero-kicker").textContent = BRAND.heroKicker;
  $("#hero-title").innerHTML =
    `<span class="thin">Shop</span> ${escapeHtml(BRAND.name)}`;
  $("#hero-tagline").textContent = BRAND.tagline;
  $("#handoff").textContent = BRAND.sellerNote;
  $("#footer-legal").textContent =
    `Sold by ${BRAND.sellerOfRecord}, a licensed California retailer. ` +
    `Must be 21 or older to purchase. Valid ID required at delivery.`;
  $("#footer-year").textContent = new Date().getFullYear();

  // The logo is the thread back to the brand's own site. Because that isn't
  // where a logo normally goes, it carries an explicit label for screen readers.
  const home = $("#brand-home");
  home.href = BRAND.backToSiteUrl;
  home.setAttribute("aria-label", `${BRAND.name} \u2014 ${BRAND.backToSiteLabel}`);

  const logo = $("#brand-logo");
  if (BRAND.logo) { logo.src = BRAND.logo; logo.alt = BRAND.name; }
  else logo.remove();

  renderNav();
}

// Header nav, driven entirely by BRAND.nav so onboarding a brand stays a
// config edit. External links open in a new tab: a shopper mid-cart who taps
// "Merch" should not lose the shop.
function renderNav() {
  const nav = $("#brand-nav");
  if (!nav) return;
  const links = BRAND.nav || [];
  if (!links.length) { nav.remove(); return; }

  nav.innerHTML = "";
  for (const item of links) {
    const a = document.createElement("a");
    a.className = "masthead__link";
    a.href = item.href;
    a.textContent = item.label;
    if (item.external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    nav.appendChild(a);
  }
}

function showLoading() {
  const grid = $("#grid");
  grid.className = "grid";
  grid.innerHTML = Array.from({ length: 6 }, () => `<div class="skeleton"></div>`).join("");
}

function showFailure(err) {
  const grid = $("#grid");
  grid.className = "";
  const phone = BRAND.supportPhone
    ? ` or call <a href="tel:${BRAND.supportPhone.replace(/[^\d+]/g, "")}">${BRAND.supportPhone}</a>`
    : "";
  grid.innerHTML = `<div class="state">
    <h2 class="state__title">The catalog didn't load</h2>
    <p>Something went wrong reaching our catalog. Refresh the page to try again.</p>
    <p>Still stuck? Email <a href="mailto:${BRAND.supportEmail}">${BRAND.supportEmail}</a>${phone}.</p>
  </div>`;
  console.error("[catalog]", err);
}

async function init() {
  // Painting the chrome must never take the catalog down with it. A stale
  // cached app.js against newer HTML threw here once and blanked the whole
  // page; a shop that renders without its header still sells.
  try {
    paintStaticCopy();
  } catch (err) {
    console.error("[chrome] header/footer failed to paint", err);
  }
  renderCartButton();
  renderCart();

  $("#cart-open").addEventListener("click", openDrawer);
  $("#drawer-close").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  $("#checkout").addEventListener("click", checkout);

  showLoading();
  try {
    allProducts = await loadCatalog();
    if (!allProducts.length) {
      $("#grid").className = "";
      $("#grid").innerHTML = `<div class="state">
        <h2 class="state__title">Nothing on tap yet</h2>
        <p>This shop doesn't have any beer listed right now. Check back soon.</p>
      </div>`;
      return;
    }
    renderFilters();
    renderGrid();
  } catch (err) {
    showFailure(err);
  }
}

init();
