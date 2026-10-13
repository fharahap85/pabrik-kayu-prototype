/* Kalkulator kubikasi: hitung langsung + daftar beberapa ukuran */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.getElementById(s);
  const ROWS_KEY = "sjn_calc_rows_v1";
  let rows = Store.read(ROWS_KEY);
  let priceTouched = false;

  $("c-species").innerHTML = Object.entries(SPECIES).map(([k, s]) => `<option value="${k}">${s.name}</option>`).join("");
  $("c-grade").innerHTML = Object.entries(GRADES).map(([k, g]) => `<option value="${k}">${g.label}</option>`).join("");

  // isian awal dari URL, mis. dari halaman detail
  const params = new URLSearchParams(location.search);
  if (SPECIES[params.get("kayu")]) $("c-species").value = params.get("kayu");
  if (GRADES[params.get("grade")]) $("c-grade").value = params.get("grade");

  const num = (id) => parseFloat(String($(id).value).replace(",", ".")) || 0;

  function autoPrice() {
    if (priceTouched) return;
    $("c-price").value = SPECIES[$("c-species").value].price * GRADES[$("c-grade").value].factor;
  }

  function compute() {
    const t = num("c-t"), l = num("c-l"), p = num("c-p"), qty = Math.floor(num("c-qty"));
    const sp = SPECIES[$("c-species").value];
    const price = num("c-price");
    const vol1 = (t * l * p) / 10000;
    return { t, l, p, qty, sp, price, vol1, vol: vol1 * qty, piece: vol1 * price, total: vol1 * qty * price, weight: vol1 * qty * sp.density * 1000 };
  }

  function renderResult() {
    const r = compute();
    const ok = r.vol1 > 0 && r.qty > 0;
    $("r-vol1").textContent = r.vol1 > 0 ? `${fmtNum(r.vol1, 4)} m³` : "—";
    $("r-vol").textContent = ok ? `${fmtNum(r.vol, 3)} m³` : "—";
    $("r-perm3").textContent = r.vol1 > 0 ? `± ${fmtNum(1 / r.vol1, 1)} batang` : "—";
    $("r-weight").textContent = ok ? `± ${fmtNum(r.weight, 0)} kg` : "—";
    $("r-piece").textContent = r.vol1 > 0 ? fmtIDR(r.piece) : "—";
    $("r-total").textContent = ok ? fmtIDR(r.total) : "—";
    $("r-species-note").textContent = `${r.sp.name}: ${r.sp.durability}, ${r.sp.strength}, berat jenis ${fmtNum(r.sp.density, 2)}.`;
  }

  function validate() {
    let valid = true;
    [["c-t", (v) => v > 0], ["c-l", (v) => v > 0], ["c-p", (v) => v > 0], ["c-qty", (v) => v >= 1]].forEach(([id, test]) => {
      const f = $(id).closest(".field");
      const ok = test(num(id));
      f.classList.toggle("invalid", !ok);
      if (!ok && valid) { $(id).focus(); valid = false; }
    });
    return valid;
  }

  function renderRows() {
    const has = rows.length > 0;
    $("rows-empty").hidden = has;
    $("rows-wrap").hidden = !has;
    $("send-rows").hidden = !has;
    $("clear-rows").hidden = !has;
    if (!has) return;
    $("rows").innerHTML = rows.map((r, i) => {
      const sp = SPECIES[r.species];
      return `<tr>
        <td><span class="swatch-dot" style="background:${sp.base}"></span>${sp.name} <span class="muted">· ${GRADES[r.grade].label}</span></td>
        <td>${fmtNum(r.t, 1)} × ${fmtNum(r.l, 1)} cm × ${fmtNum(r.p, 1)} m</td>
        <td class="num">${fmtNum(r.qty, 0)}</td>
        <td class="num">${fmtNum(r.vol1 * r.qty, 3)} m³</td>
        <td class="num">${fmtIDR(r.vol1 * r.qty * r.price)}</td>
        <td class="num"><button class="link-btn" type="button" data-del="${i}">Hapus</button></td>
      </tr>`;
    }).join("");
    $("rows-vol").textContent = `${fmtNum(rows.reduce((a, r) => a + r.vol1 * r.qty, 0), 3)} m³`;
    $("rows-total").textContent = fmtIDR(rows.reduce((a, r) => a + r.vol1 * r.qty * r.price, 0));
  }
  const saveRows = () => { Store.write(ROWS_KEY, rows); renderRows(); };

  /* Event */
  $("c-price").addEventListener("input", () => { priceTouched = true; renderResult(); });
  ["c-t", "c-l", "c-p", "c-qty"].forEach((id) => $(id).addEventListener("input", () => {
    $(id).closest(".field").classList.remove("invalid");
    renderResult();
  }));
  // jenis kayu/grade diganti → kembalikan ke harga pabrik
  ["c-species", "c-grade"].forEach((id) => $(id).addEventListener("change", () => { priceTouched = false; autoPrice(); renderResult(); }));

  $("calc-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    const r = compute();
    rows.push({ species: $("c-species").value, grade: $("c-grade").value, t: r.t, l: r.l, p: r.p, qty: r.qty, price: r.price, vol1: r.vol1 });
    saveRows();
    toast("Ukuran ditambahkan ke daftar");
  });

  $("rows").addEventListener("click", (e) => {
    const b = e.target.closest("[data-del]");
    if (!b) return;
    rows.splice(+b.dataset.del, 1);
    saveRows();
  });
  $("clear-rows").addEventListener("click", () => { rows = []; saveRows(); });

  $("send-rows").addEventListener("click", () => {
    rows.forEach((r) => {
      const sp = SPECIES[r.species];
      const unitPrice = Math.round((r.vol1 * r.price) / 100) * 100;
      Store.add({
        key: `calc|${r.species}|${r.grade}|${r.t}x${r.l}x${r.p}|${unitPrice}`,
        custom: true,
        species: r.species,
        name: `${sp.name} ukuran khusus`,
        detail: `${fmtNum(r.t, 1)} × ${fmtNum(r.l, 1)} cm, panjang ${fmtNum(r.p, 1)} m · ${GRADES[r.grade].label}`,
        pieceUnit: "batang",
        unitPrice,
        volume: r.vol1,
        qty: r.qty,
      });
    });
    const n = rows.length;
    rows = [];
    saveRows();
    toast(`${n} ukuran masuk ke daftar penawaran`, { href: "penawaran.html", label: "Lihat daftar" });
  });

  autoPrice();
  renderResult();
  renderRows();
});
