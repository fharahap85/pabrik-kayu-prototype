/* =========================================================
   APP CORE — dipakai semua halaman
   - Header & footer
   - Penyimpanan daftar penawaran (localStorage)
   - Format Rupiah, perhitungan harga
   - Generator tekstur serat kayu (SVG)
   ========================================================= */

/* ---------- Format ---------- */
const fmtIDR = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
const fmtNum = (n, d = 3) => Number(n).toLocaleString("id-ID", { maximumFractionDigits: d, minimumFractionDigits: 0 });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Produk & harga ---------- */
const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
const unitLabel = (u) => ({ m3: "m³", lembar: "lembar", batang: "batang", set: "set" }[u] || u);
const pieceLabel = (u) => (u === "m3" ? "batang" : unitLabel(u));

function pricePerM3(p) {
  return SPECIES[p.species].price * GRADES[p.grade].factor;
}
function variantVolume(v) {
  // tebal cm × lebar cm × panjang m → m³
  return (v.t / 100) * (v.l / 100) * v.p;
}
function variantLabel(p, i) {
  const v = p.variants[i];
  if (p.unit !== "m3") return v.label;
  return `${fmtNum(v.t, 1)} × ${fmtNum(v.l, 1)} cm, panjang ${fmtNum(v.p, 1)} m`;
}
function variantPrice(p, i) {
  const v = p.variants[i];
  if (p.unit !== "m3") return v.price;
  return Math.round(variantVolume(v) * pricePerM3(p) / 100) * 100;
}
function startingPrice(p) {
  if (p.unit === "m3") return { value: pricePerM3(p), per: "m³" };
  return { value: Math.min(...p.variants.map((v) => v.price)), per: unitLabel(p.unit) };
}

/* ---------- Penyimpanan daftar penawaran ---------- */
const Store = {
  KEY: "sjn_quote_v1",
  HIST: "sjn_history_v1",
  read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  },
  write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage penuh / diblokir */ }
  },
  items() { return this.read(this.KEY); },
  save(items) { this.write(this.KEY, items); updateBadge(); },
  add(item) {
    const items = this.items();
    const found = items.find((x) => x.key === item.key);
    if (found) found.qty += item.qty; else items.push(item);
    this.save(items);
  },
  setQty(key, qty) {
    const items = this.items();
    const it = items.find((x) => x.key === key);
    if (it) it.qty = Math.max(1, qty);
    this.save(items);
  },
  remove(key) { this.save(this.items().filter((x) => x.key !== key)); },
  clear() { this.save([]); },
  count() { return this.items().length; },
  history() { return this.read(this.HIST); },
  pushHistory(entry) { const h = this.history(); h.unshift(entry); this.write(this.HIST, h.slice(0, 20)); },
};

/* Ubah item tersimpan menjadi baris lengkap (nama, harga, volume). */
function resolveItem(it) {
  if (it.custom) {
    return { ...it, unitPrice: it.unitPrice, subtotal: it.unitPrice * it.qty, volume: (it.volume || 0) * it.qty };
  }
  const p = getProduct(it.id);
  if (!p) return null;
  const unitPrice = variantPrice(p, it.v);
  return {
    ...it,
    name: p.name,
    species: p.species,
    detail: `${variantLabel(p, it.v)} · ${GRADES[p.grade].label}`,
    pieceUnit: pieceLabel(p.unit),
    unitPrice,
    subtotal: unitPrice * it.qty,
    volume: p.unit === "m3" ? variantVolume(p.variants[it.v]) * it.qty : 0,
  };
}

/* ---------- Generator serat kayu ---------- */
function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* Tekstur serat memanjang (tampak atas papan). */
function woodGrainSVG(speciesKey, seed = "x", { w = 400, h = 240, knots = true } = {}) {
  const sp = SPECIES[speciesKey] || SPECIES.jati;
  const r = seededRandom(seed + speciesKey);
  const lines = [];
  const count = 26 + Math.floor(r() * 10);
  const knotX = w * (0.25 + r() * 0.5), knotY = h * (0.25 + r() * 0.5), hasKnot = knots && r() > 0.35;
  for (let i = 0; i < count; i++) {
    const y0 = (i / count) * h + r() * 6;
    const amp = 2 + r() * 6, freq = 0.6 + r() * 1.4, phase = r() * Math.PI * 2;
    let d = `M -10 ${y0.toFixed(1)}`;
    for (let x = 0; x <= w + 20; x += 20) {
      let y = y0 + Math.sin((x / w) * Math.PI * freq * 2 + phase) * amp;
      if (hasKnot) {
        const dx = x - knotX, dy = y0 - knotY, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 70) y += (dy >= 0 ? 1 : -1) * (70 - dist) * 0.45;
      }
      d += ` L ${x} ${y.toFixed(1)}`;
    }
    const op = (0.18 + r() * 0.45).toFixed(2), sw = (0.6 + r() * 1.8).toFixed(1);
    lines.push(`<path d="${d}" stroke="${sp.grain}" stroke-opacity="${op}" stroke-width="${sw}" fill="none"/>`);
  }
  const knot = hasKnot
    ? `<ellipse cx="${knotX}" cy="${knotY}" rx="16" ry="9" fill="${sp.grain}" opacity=".55"/><ellipse cx="${knotX}" cy="${knotY}" rx="9" ry="5" fill="${sp.grain}" opacity=".7"/>`
    : "";
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="${w}" height="${h}" fill="${sp.base}"/>${lines.join("")}${knot}
  </svg>`;
}

/* Penampang ujung log (lingkaran tahun). */
function endGrainSVG(speciesKey, seed = "log", { size = 400, rings = 34, animate = false } = {}) {
  const sp = SPECIES[speciesKey] || SPECIES.jati;
  const r = seededRandom(seed);
  const c = size / 2, maxR = size / 2 - 14;
  const cx = c + (r() - 0.5) * 18, cy = c + (r() - 0.5) * 18; // empulur sedikit off-center
  const ringPath = (rad, jitter) => {
    let d = "";
    const steps = 72;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const n = Math.sin(a * 3 + rad * 0.07) * jitter + Math.sin(a * 7 + rad) * jitter * 0.4;
      const x = cx + Math.cos(a) * (rad + n), y = cy + Math.sin(a) * (rad + n);
      d += (i ? " L " : "M ") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d + " Z";
  };
  let out = "";
  for (let i = 1; i <= rings; i++) {
    const rad = (i / rings) * (maxR - 26);
    const sw = (0.7 + r() * 1.6).toFixed(1), op = (0.35 + r() * 0.5).toFixed(2);
    const delay = animate ? `style="--d:${(i * 0.035).toFixed(3)}s"` : "";
    out += `<path class="ring" ${delay} d="${ringPath(rad, 1 + i * 0.12)}" fill="none" stroke="${sp.grain}" stroke-width="${sw}" stroke-opacity="${op}" pathLength="1"/>`;
  }
  // retakan radial halus
  let cracks = "";
  for (let i = 0; i < 4; i++) {
    const a = r() * Math.PI * 2, len = 30 + r() * 60;
    cracks += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * len).toFixed(1)}" y2="${(cy + Math.sin(a) * len).toFixed(1)}" stroke="${sp.grain}" stroke-width="1.2" opacity=".5"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Penampang kayu ${sp.name}">
    <circle cx="${c}" cy="${c}" r="${maxR + 10}" fill="#5A3E2B"/>
    <circle cx="${c}" cy="${c}" r="${maxR}" fill="#7D5A3C"/>
    <path d="${ringPath(maxR - 18, 3)}" fill="${sp.base}"/>
    ${out}${cracks}
    <circle cx="${cx}" cy="${cy}" r="3.5" fill="${sp.grain}"/>
  </svg>`;
}

/* ---------- Komponen ---------- */
function stockStamp(p) {
  return p.stock === "ready"
    ? `<span class="stamp stamp-ready">Siap kirim</span>`
    : `<span class="stamp stamp-po">Pre-order</span>`;
}

function productCard(p) {
  const sp = SPECIES[p.species];
  const price = startingPrice(p);
  return `<article class="pcard">
    <a class="pcard-swatch" href="detail.html?id=${p.id}" tabindex="-1" aria-hidden="true">${woodGrainSVG(p.species, p.id)}</a>
    <div class="pcard-body">
      <div class="pcard-stamps">${stockStamp(p)}<span class="stamp">${GRADES[p.grade].label}</span></div>
      <h3 class="pcard-title"><a href="detail.html?id=${p.id}">${esc(p.name)}</a></h3>
      <p class="pcard-species">${sp.name} <em>${sp.latin}</em></p>
      <p class="pcard-price"><span>Mulai</span> <strong>${fmtIDR(price.value)}</strong> <span>/ ${price.per}</span></p>
    </div>
  </article>`;
}

/* ---------- Toast ---------- */
function toast(msg, action) {
  let wrap = document.querySelector(".toasts");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toasts";
    wrap.setAttribute("role", "status");
    wrap.setAttribute("aria-live", "polite");
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<a href="${action.href}">${esc(action.label)}</a>` : ""}`;
  wrap.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 300); }, 3600);
}

/* ---------- Layout ---------- */
const NAV = [
  { href: "index.html", label: "Beranda", key: "home" },
  { href: "produk.html", label: "Katalog", key: "produk" },
  { href: "kalkulator.html", label: "Kalkulator kubikasi", key: "kalkulator" },
  { href: "kontak.html", label: "Kontak", key: "kontak" },
];

function logoMark() {
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="21" cy="19" r="12" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="21.5" cy="18.5" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="22" cy="18" r="1.8" fill="currentColor"/></svg>`;
}

function renderLayout(active) {
  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <div class="container header-inner">
        <a class="brand" href="index.html">${logoMark()}<span><strong>${COMPANY.name}</strong><small>Pabrik kayu, Jepara</small></span></a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span></span><span class="sr-only">Menu</span></button>
        <nav id="main-nav" class="main-nav" aria-label="Navigasi utama">
          ${NAV.map((n) => `<a href="${n.href}" ${n.key === active ? 'aria-current="page"' : ""}>${n.label}</a>`).join("")}
          <a class="btn btn-primary nav-quote" href="penawaran.html" ${active === "penawaran" ? 'aria-current="page"' : ""}>Daftar penawaran <span class="badge" data-badge>0</span></a>
        </nav>
      </div>`;
    const toggle = header.querySelector(".nav-toggle");
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <div class="container footer-grid">
        <div>
          <a class="brand brand-light" href="index.html">${logoMark()}<span><strong>${COMPANY.name}</strong><small>${COMPANY.legal}</small></span></a>
          <p class="footer-note">Kayu gergajian, olahan, dan plywood untuk kontraktor, pengrajin mebel, dan eksportir sejak 1998.</p>
        </div>
        <div>
          <h4>Produk</h4>
          <ul>${CATEGORIES.map((c) => `<li><a href="produk.html?kategori=${c.id}">${c.name}</a></li>`).join("")}</ul>
        </div>
        <div>
          <h4>Pabrik</h4>
          <address>${COMPANY.address}</address>
          <p><a href="tel:${COMPANY.phone.replace(/-/g, "")}">${COMPANY.phone}</a><br><a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>
        </div>
        <div>
          <h4>Jam operasional</h4>
          <p>Senin–Sabtu<br>${COMPANY.hours.open}–${COMPANY.hours.close} WIB</p>
          <a class="btn btn-wa" href="https://wa.me/${COMPANY.whatsapp}" target="_blank" rel="noopener">Chat WhatsApp</a>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© ${new Date().getFullYear()} ${COMPANY.legal}</span>
        <span>Prototype — data produk dan harga adalah contoh.</span>
      </div>`;
  }
  updateBadge();
}

function updateBadge() {
  const n = Store.count();
  document.querySelectorAll("[data-badge]").forEach((b) => {
    b.textContent = n;
    b.hidden = n === 0;
  });
}

/* Sinkronkan badge antar tab browser */
window.addEventListener("storage", (e) => { if (e.key === Store.KEY) updateBadge(); });

document.addEventListener("DOMContentLoaded", () => {
  renderLayout(document.body.dataset.page);
});
