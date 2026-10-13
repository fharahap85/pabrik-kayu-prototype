/* Beranda */
document.addEventListener("DOMContentLoaded", () => {
  /* Hero: penampang log yang bisa diganti jenis kayunya */
  const logWrap = document.getElementById("hero-log-svg");
  const stampSpecies = document.getElementById("stamp-species");
  const picker = document.querySelector(".species-picker");
  const heroSpecies = ["jati", "merbau", "kamper", "sengon"];
  let first = true;

  function drawLog(key) {
    logWrap.innerHTML = endGrainSVG(key, "hero-" + key, { size: 420, rings: 36, animate: first });
    stampSpecies.textContent = SPECIES[key].name;
    picker.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.sp === key));
    first = false;
  }
  picker.innerHTML = heroSpecies.map((k) => `<button type="button" data-sp="${k}">${SPECIES[k].name}</button>`).join("");
  picker.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) drawLog(b.dataset.sp);
  });
  drawLog("jati");

  /* Angka ringkas */
  const readyM3 = PRODUCTS.filter((p) => p.unit === "m3" && p.stock === "ready").reduce((a, p) => a + p.stockQty, 0);
  document.getElementById("fact-stock").textContent = `${readyM3} m³`;
  document.getElementById("fact-species").textContent = Object.keys(SPECIES).length;

  /* Kategori */
  document.getElementById("cat-list").innerHTML = CATEGORIES.map((c) => {
    const n = PRODUCTS.filter((p) => p.category === c.id).length;
    return `<li><a class="cat-row" href="produk.html?kategori=${c.id}">
      <div class="cat-strip">${woodGrainSVG(c.species, "cat-" + c.id, { w: 440, h: 60, knots: false })}</div>
      <div><h3>${c.name}</h3><p>${c.desc}</p></div>
      <span class="cat-count">${n} produk</span>
    </a></li>`;
  }).join("");

  /* Proses */
  document.getElementById("process").innerHTML = PROCESS.map((s) => `<li><h3>${s.title}</h3><p>${s.text}</p></li>`).join("");

  /* Produk unggulan */
  document.getElementById("featured").innerHTML = PRODUCTS.filter((p) => p.featured).slice(0, 4).map(productCard).join("");

  /* Testimoni */
  document.getElementById("quotes").innerHTML = TESTIMONIALS.map((t) => `
    <figure><blockquote>“${esc(t.quote)}”</blockquote>
    <figcaption><strong>${esc(t.name)}</strong><span>${esc(t.role)}</span></figcaption></figure>`).join("");
});
