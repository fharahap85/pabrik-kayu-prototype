/* Detail produk: varian, jumlah, tambah ke penawaran */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("detail-root");
  const id = new URLSearchParams(location.search).get("id");
  const p = getProduct(id);

  if (!p) {
    document.title = "Produk tidak ditemukan — Serat Jati Nusantara";
    root.innerHTML = `<div class="empty" style="margin: var(--s-7) 0 var(--s-8)">
      <h3>Produk tidak ditemukan</h3>
      <p>Tautan mungkin sudah tidak berlaku atau produk sudah tidak dijual. Lihat produk lain di katalog.</p>
      <a class="btn btn-primary" href="produk.html">Buka katalog</a></div>`;
    return;
  }

  const sp = SPECIES[p.species];
  const cat = getCategory(p.category);
  const isM3 = p.unit === "m3";
  const piece = pieceLabel(p.unit);
  document.title = `${p.name} — Serat Jati Nusantara`;

  const views = [
    { key: "a", label: "Permukaan", svg: () => woodGrainSVG(p.species, p.id, { w: 600, h: 450 }) },
    { key: "b", label: "Permukaan sisi lain", svg: () => woodGrainSVG(p.species, p.id + "-b", { w: 600, h: 450 }) },
    { key: "end", label: "Penampang ujung", svg: () => `<div class="end-wrap" style="width:100%;height:100%;display:grid;place-items:center;background:var(--ash-2)">${endGrainSVG(p.species, p.id, { size: 400, rings: 28 })}</div>` },
  ];

  root.innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb" style="margin-top: var(--s-5)">
      <a href="index.html">Beranda</a> / <a href="produk.html">Katalog</a> / <a href="produk.html?kategori=${cat.id}">${cat.name}</a> / ${esc(p.name)}
    </nav>
    <div class="detail">
      <div>
        <div class="gallery-main" id="g-main">${views[0].svg()}</div>
        <div class="gallery-thumbs" role="group" aria-label="Pilih tampilan">
          ${views.map((v, i) => `<button type="button" class="${v.key === "end" ? "end" : ""}" data-i="${i}" aria-pressed="${i === 0}" aria-label="${v.label}">${v.key === "end" ? endGrainSVG(p.species, p.id, { size: 200, rings: 18 }) : woodGrainSVG(p.species, p.id + (v.key === "b" ? "-b" : ""), { w: 200, h: 150 })}</button>`).join("")}
        </div>
        <table class="specs">
          <tr><th>Jenis kayu</th><td>${sp.name} (<em>${sp.latin}</em>)</td></tr>
          <tr><th>Grade</th><td>${GRADES[p.grade].label} — ${GRADES[p.grade].note}</td></tr>
          <tr><th>Kadar air</th><td>${p.moisture}</td></tr>
          <tr><th>Keawetan / kekuatan</th><td>${sp.durability}, ${sp.strength}</td></tr>
          <tr><th>Berat jenis rata-rata</th><td>${fmtNum(sp.density, 2)} g/cm³</td></tr>
          <tr><th>Minimal pemesanan</th><td>${p.minOrder}</td></tr>
          <tr><th>Stok</th><td>${p.stock === "ready" ? `${fmtNum(p.stockQty, 0)} ${unitLabel(p.unit)} siap kirim` : "Diproduksi sesuai pesanan"}</td></tr>
        </table>
      </div>

      <div>
        <div class="pcard-stamps">${stockStamp(p)}<span class="stamp">${GRADES[p.grade].label}</span><span class="stamp">${p.moisture}</span></div>
        <h1>${esc(p.name)}</h1>
        <p class="species-line">${sp.name}, <em>${sp.latin}</em> · ${cat.name}</p>
        <p>${esc(p.desc)}</p>

        <div class="price-box">
          <div><span class="big" id="price-piece"></span> <span class="per">/ ${piece}</span></div>
          ${isM3 ? `<p class="sub">Harga dasar ${fmtIDR(pricePerM3(p))} per m³</p>` : ""}
        </div>

        <fieldset style="border:0;padding:0;margin:0">
          <legend class="label" style="font-weight:600;margin-bottom:var(--s-2)">Pilih ukuran</legend>
          <div class="variants" id="variants">
            ${p.variants.map((_, i) => `<label class="variant"><input type="radio" name="variant" value="${i}" ${i === 0 ? "checked" : ""}><span>${variantLabel(p, i)}</span><span>${fmtIDR(variantPrice(p, i))}</span></label>`).join("")}
          </div>
        </fieldset>

        <div class="label" style="font-weight:600;margin-bottom:var(--s-2)" id="qty-label">Jumlah (${piece})</div>
        <div class="buy-row">
          <div class="qty" role="group" aria-labelledby="qty-label">
            <button type="button" data-step="-1" aria-label="Kurangi">−</button>
            <input type="number" id="qty" value="${isM3 ? 20 : 10}" min="1" inputmode="numeric" aria-label="Jumlah">
            <button type="button" data-step="1" aria-label="Tambah">+</button>
          </div>
          <button class="btn btn-primary" type="button" id="add" style="flex:1">Tambahkan ke penawaran</button>
        </div>
        <p class="calc-line" id="calc-line"></p>

        <h3 style="margin-top: var(--s-6)">Cocok untuk</h3>
        <ul class="uses">${p.uses.map((u) => `<li>${esc(u)}</li>`).join("")}</ul>

        <p style="margin-top: var(--s-6)" class="muted">Butuh ukuran lain? <a href="kalkulator.html?kayu=${p.species}&grade=${p.grade}">Hitung di kalkulator kubikasi</a> atau tulis di catatan penawaran.</p>
      </div>
    </div>`;

  /* Galeri */
  const gMain = document.getElementById("g-main");
  root.querySelector(".gallery-thumbs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    gMain.innerHTML = views[+b.dataset.i].svg();
    root.querySelectorAll(".gallery-thumbs button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  });

  /* Harga dinamis */
  const qtyEl = document.getElementById("qty");
  const currentVariant = () => +root.querySelector('input[name="variant"]:checked').value;
  const currentQty = () => Math.max(1, parseInt(qtyEl.value, 10) || 1);

  function update() {
    const v = currentVariant(), q = currentQty();
    const unit = variantPrice(p, v);
    document.getElementById("price-piece").textContent = fmtIDR(unit);
    let line = `${fmtNum(q, 0)} ${piece} × ${fmtIDR(unit)} = <strong>${fmtIDR(unit * q)}</strong>`;
    if (isM3) line += ` · total ${fmtNum(variantVolume(p.variants[v]) * q, 3)} m³`;
    document.getElementById("calc-line").innerHTML = line;
  }
  root.querySelector("#variants").addEventListener("change", update);
  qtyEl.addEventListener("input", update);
  qtyEl.addEventListener("blur", () => { qtyEl.value = currentQty(); update(); });
  root.querySelector(".qty").addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (!b) return;
    qtyEl.value = Math.max(1, currentQty() + +b.dataset.step);
    update();
  });

  document.getElementById("add").addEventListener("click", () => {
    const v = currentVariant();
    Store.add({ key: `${p.id}|${v}`, id: p.id, v, qty: currentQty() });
    toast(`${p.name} ditambahkan ke penawaran`, { href: "penawaran.html", label: "Lihat daftar" });
  });

  update();

  /* Produk serupa */
  const related = PRODUCTS.filter((x) => x.id !== p.id && (x.category === p.category || x.species === p.species)).slice(0, 4);
  if (related.length) {
    document.getElementById("related").innerHTML = related.map(productCard).join("");
    document.getElementById("related-wrap").hidden = false;
  }
});
