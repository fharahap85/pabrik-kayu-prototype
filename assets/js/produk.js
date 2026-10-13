/* Katalog: pencarian, filter, urutan, sinkron dengan URL */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const state = { q: "", kategori: [], kayu: [], grade: [], ready: false, sort: "populer" };

  /* Baca URL → state */
  const params = new URLSearchParams(location.search);
  state.q = params.get("q") || "";
  state.kategori = (params.get("kategori") || "").split(",").filter(Boolean);
  state.kayu = (params.get("kayu") || "").split(",").filter(Boolean);
  state.grade = (params.get("grade") || "").split(",").filter(Boolean);
  state.ready = params.get("ready") === "1";
  state.sort = params.get("sort") || "populer";

  /* Bangun checkbox */
  const checkGroup = (el, name, entries) => {
    el.innerHTML = entries.map(([val, label]) => {
      const n = PRODUCTS.filter((p) => p[name === "kayu" ? "species" : name === "kategori" ? "category" : "grade"] === val).length;
      return `<label class="check"><input type="checkbox" name="${name}" value="${val}"> ${label}<span class="count">${n}</span></label>`;
    }).join("");
  };
  checkGroup($("#f-cat"), "kategori", CATEGORIES.map((c) => [c.id, c.name]));
  checkGroup($("#f-species"), "kayu", Object.entries(SPECIES).map(([k, s]) => [k, s.name]));
  checkGroup($("#f-grade"), "grade", Object.entries(GRADES).map(([k, g]) => [k, g.label]));

  /* State → kontrol */
  function syncControls() {
    $("#q").value = state.q;
    $("#f-ready").checked = state.ready;
    $("#sort").value = state.sort;
    document.querySelectorAll('.filters input[type="checkbox"][name]').forEach((cb) => {
      cb.checked = state[cb.name].includes(cb.value);
    });
  }

  function writeURL() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.kategori.length) p.set("kategori", state.kategori.join(","));
    if (state.kayu.length) p.set("kayu", state.kayu.join(","));
    if (state.grade.length) p.set("grade", state.grade.join(","));
    if (state.ready) p.set("ready", "1");
    if (state.sort !== "populer") p.set("sort", state.sort);
    const qs = p.toString();
    history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  }

  function filtered() {
    const q = state.q.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      const sp = SPECIES[p.species];
      const hay = `${p.name} ${sp.name} ${sp.latin} ${getCategory(p.category).name} ${p.uses.join(" ")}`.toLowerCase();
      if (q && !q.split(/\s+/).every((w) => hay.includes(w))) return false;
      if (state.kategori.length && !state.kategori.includes(p.category)) return false;
      if (state.kayu.length && !state.kayu.includes(p.species)) return false;
      if (state.grade.length && !state.grade.includes(p.grade)) return false;
      if (state.ready && p.stock !== "ready") return false;
      return true;
    });
    // urutan harga memakai harga per batang/lembar termurah agar adil lintas satuan
    const cheapest = (p) => Math.min(...p.variants.map((_, i) => variantPrice(p, i)));
    const sorters = {
      populer: (a, b) => b.popularity - a.popularity,
      termurah: (a, b) => cheapest(a) - cheapest(b),
      termahal: (a, b) => cheapest(b) - cheapest(a),
      nama: (a, b) => a.name.localeCompare(b.name, "id"),
    };
    return list.sort(sorters[state.sort] || sorters.populer);
  }

  function renderChips() {
    const chips = [];
    if (state.q) chips.push({ k: "q", v: state.q, label: `“${state.q}”` });
    state.kategori.forEach((v) => chips.push({ k: "kategori", v, label: getCategory(v)?.name || v }));
    state.kayu.forEach((v) => chips.push({ k: "kayu", v, label: SPECIES[v]?.name || v }));
    state.grade.forEach((v) => chips.push({ k: "grade", v, label: `Grade ${v}` }));
    if (state.ready) chips.push({ k: "ready", v: "1", label: "Siap kirim" });
    $("#chips").innerHTML = chips.map((c) => `<button class="chip" type="button" data-k="${c.k}" data-v="${esc(c.v)}" aria-label="Hapus filter ${esc(c.label)}">${esc(c.label)}</button>`).join("");
  }

  function render() {
    const list = filtered();
    $("#count").textContent = `${list.length} dari ${PRODUCTS.length} produk`;
    $("#grid").innerHTML = list.length
      ? list.map(productCard).join("")
      : `<div class="empty" style="grid-column: 1 / -1">
          <h3>Tidak ada produk yang cocok</h3>
          <p>Coba kurangi filter atau gunakan kata kunci lain. Untuk ukuran atau jenis kayu yang tidak ada di katalog, tulis di catatan permintaan penawaran.</p>
          <button class="btn btn-dark" type="button" data-reset>Hapus semua filter</button>
        </div>`;
    renderChips();
    writeURL();
  }

  function reset() {
    Object.assign(state, { q: "", kategori: [], kayu: [], grade: [], ready: false });
    syncControls();
    render();
  }

  /* Event */
  let t;
  $("#q").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 180); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  $("#f-ready").addEventListener("change", (e) => { state.ready = e.target.checked; render(); });
  $("#filters").addEventListener("change", (e) => {
    const cb = e.target;
    if (!cb.name || !Array.isArray(state[cb.name])) return;
    state[cb.name] = cb.checked ? [...state[cb.name], cb.value] : state[cb.name].filter((v) => v !== cb.value);
    render();
  });
  $("#reset").addEventListener("click", reset);
  document.addEventListener("click", (e) => { if (e.target.closest("[data-reset]")) reset(); });
  $("#chips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    const { k, v } = c.dataset;
    if (k === "q") state.q = "";
    else if (k === "ready") state.ready = false;
    else state[k] = state[k].filter((x) => x !== v);
    syncControls();
    render();
  });
  $("#filter-toggle").addEventListener("click", (e) => {
    const open = $("#filters").classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });

  syncControls();
  render();
});
