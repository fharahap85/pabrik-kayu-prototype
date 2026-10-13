/* Daftar penawaran: edit item, formulir, kirim (simulasi), cetak, WhatsApp */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.getElementById(s);
  const TAX = 0.11;
  const CITIES = ["Jepara", "Kudus", "Semarang", "Demak", "Pati", "Solo", "Yogyakarta", "Surabaya", "Malang", "Jakarta", "Bandung", "Bekasi", "Tangerang", "Denpasar", "Cirebon"];
  $("cities").innerHTML = CITIES.map((c) => `<option value="${c}">`).join("");

  // tanggal minimal besok
  const tomorrow = new Date(Date.now() + 864e5);
  const iso = (d) => d.toISOString().slice(0, 10);
  $("f-date").min = iso(tomorrow);

  function totals(lines) {
    const sub = lines.reduce((a, l) => a + l.subtotal, 0);
    const vol = lines.reduce((a, l) => a + l.volume, 0);
    return { sub, vol, tax: sub * TAX, total: sub * (1 + TAX) };
  }

  function lines() { return Store.items().map(resolveItem).filter(Boolean); }

  function render() {
    const ls = lines();
    const empty = ls.length === 0;
    $("q-empty").hidden = !empty;
    $("q-main").hidden = empty;
    renderHistory();
    if (empty) return;

    $("q-count").textContent = ls.length;
    $("q-items").innerHTML = ls.map((l) => `
      <div class="qitem">
        <div class="qitem-swatch">${woodGrainSVG(l.species, l.id || l.key, { w: 160, h: 120 })}</div>
        <div>
          <h3>${l.custom ? esc(l.name) : `<a href="detail.html?id=${l.id}">${esc(l.name)}</a>`}</h3>
          <p class="meta">${esc(l.detail)} · ${fmtIDR(l.unitPrice)} / ${l.pieceUnit}</p>
          <div class="qitem-controls">
            <div class="qty qty-sm" role="group" aria-label="Jumlah ${esc(l.name)}">
              <button type="button" data-step="-1" data-key="${esc(l.key)}" aria-label="Kurangi">−</button>
              <input type="number" min="1" value="${l.qty}" data-key="${esc(l.key)}" aria-label="Jumlah">
              <button type="button" data-step="1" data-key="${esc(l.key)}" aria-label="Tambah">+</button>
            </div>
            <span class="muted">${l.pieceUnit}</span>
            <button class="link-btn" type="button" data-remove="${esc(l.key)}">Hapus</button>
          </div>
        </div>
        <div class="qitem-sub">${fmtIDR(l.subtotal)}${l.volume ? `<small>${fmtNum(l.volume, 3)} m³</small>` : ""}</div>
      </div>`).join("");

    const t = totals(ls);
    $("s-vol").textContent = t.vol ? `${fmtNum(t.vol, 3)} m³` : "—";
    $("s-sub").textContent = fmtIDR(t.sub);
    $("s-tax").textContent = fmtIDR(t.tax);
    $("s-total").textContent = fmtIDR(t.total);
  }

  /* Edit item */
  $("q-items").addEventListener("click", (e) => {
    const step = e.target.closest("[data-step]");
    const rm = e.target.closest("[data-remove]");
    if (step) {
      const it = Store.items().find((x) => x.key === step.dataset.key);
      if (it) Store.setQty(it.key, it.qty + +step.dataset.step);
      render();
    } else if (rm) {
      const name = resolveItem(Store.items().find((x) => x.key === rm.dataset.remove))?.name;
      Store.remove(rm.dataset.remove);
      render();
      toast(`${name || "Item"} dihapus dari daftar`);
    }
  });
  $("q-items").addEventListener("change", (e) => {
    if (e.target.matches("input[data-key]")) {
      Store.setQty(e.target.dataset.key, parseInt(e.target.value, 10) || 1);
      render();
    }
  });
  $("q-clear").addEventListener("click", () => {
    if (confirm("Hapus semua item dari daftar penawaran?")) { Store.clear(); render(); }
  });

  /* Validasi */
  const rules = {
    "f-name": (v) => v.trim().length >= 2,
    "f-email": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    "f-phone": (v) => /^(08|628|\+628)\d{8,12}$/.test(v.replace(/[\s-]/g, "")),
    "f-city": (v) => v.trim().length >= 2,
    "f-date": (v) => !!v && v >= iso(tomorrow),
  };
  Object.keys(rules).forEach((id) => {
    $(id).addEventListener("blur", () => { if ($(id).value) check(id); });
    $(id).addEventListener("input", () => $(id).closest(".field").classList.remove("invalid"));
  });
  function check(id) {
    const ok = rules[id]($(id).value);
    $(id).closest(".field").classList.toggle("invalid", !ok);
    $(id).setAttribute("aria-invalid", !ok);
    return ok;
  }

  $("q-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = Object.keys(rules).filter((id) => !check(id));
    const agreed = $("f-agree").checked;
    $("agree-error").hidden = agreed;
    if (bad.length) { $(bad[0]).focus(); return; }
    if (!agreed) { $("f-agree").focus(); return; }

    const btn = e.submitter || $("q-form").querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Mengirim…";

    // Simulasi panggilan API — ganti dengan fetch() ke backend nanti
    setTimeout(() => {
      const ls = lines();
      const t = totals(ls);
      const now = new Date();
      const number = `SJN-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const customer = Object.fromEntries(["name", "company", "email", "phone", "city", "date", "type", "note"].map((k) => [k, $("f-" + k).value.trim()]));
      const entry = { number, createdAt: now.toISOString(), customer, lines: ls, totals: t, status: "Menunggu konfirmasi" };
      Store.pushHistory(entry);
      Store.clear();
      showSuccess(entry);
    }, 700);
  });

  function waText(entry) {
    const c = entry.customer;
    const items = entry.lines.map((l, i) => `${i + 1}. ${l.name} — ${l.detail} — ${l.qty} ${l.pieceUnit}`).join("\n");
    return `Halo ${COMPANY.name}, saya ingin konfirmasi permintaan penawaran *${entry.number}*.\n\n${items}\n\nEstimasi: ${fmtIDR(entry.totals.total)}\nNama: ${c.name}${c.company ? ` (${c.company})` : ""}\nKota: ${c.city}\nDibutuhkan: ${new Date(c.date).toLocaleDateString("id-ID", { dateStyle: "long" })}`;
  }

  function showSuccess(entry) {
    const c = entry.customer;
    $("q-main").hidden = true;
    $("q-empty").hidden = true;
    document.querySelector(".page-head").hidden = true;
    const box = $("q-success");
    box.hidden = false;
    box.innerHTML = `
      <div class="success">
        <div class="print-only" style="margin-bottom: var(--s-5)">
          <strong style="font-family: var(--f-display); font-size: 1.6rem">${COMPANY.legal}</strong><br>
          <span>${COMPANY.address} · ${COMPANY.phone} · ${COMPANY.email}</span>
        </div>
        <span class="stamp">Terkirim</span>
        <h2>Permintaan ${entry.number} sudah kami terima</h2>
        <p>Terima kasih, ${esc(c.name)}. Tim penjualan akan menghubungi ${esc(c.phone)} atau ${esc(c.email)} dengan harga final dan ongkos kirim ke ${esc(c.city)} dalam 1 hari kerja.</p>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Produk</th><th>Ukuran</th><th class="num">Jumlah</th><th class="num">Harga satuan</th><th class="num">Subtotal</th></tr></thead>
            <tbody>${entry.lines.map((l) => `<tr><td>${esc(l.name)}</td><td>${esc(l.detail)}</td><td class="num">${fmtNum(l.qty, 0)} ${l.pieceUnit}</td><td class="num">${fmtIDR(l.unitPrice)}</td><td class="num">${fmtIDR(l.subtotal)}</td></tr>`).join("")}</tbody>
            <tfoot>
              <tr><td colspan="4">Subtotal</td><td class="num">${fmtIDR(entry.totals.sub)}</td></tr>
              <tr><td colspan="4" style="border-top:0;font-weight:400">PPN 11%</td><td class="num" style="border-top:0;font-weight:400">${fmtIDR(entry.totals.tax)}</td></tr>
              <tr><td colspan="4" style="border-top:0">Estimasi total (belum termasuk ongkir)</td><td class="num" style="border-top:0">${fmtIDR(entry.totals.total)}</td></tr>
            </tfoot>
          </table>
        </div>
        <p class="muted" style="margin-top: var(--s-4)">Dibutuhkan ${new Date(c.date).toLocaleDateString("id-ID", { dateStyle: "long" })} · ${esc(c.type)}${c.note ? ` · Catatan: ${esc(c.note)}` : ""}</p>
        <div class="success-actions no-print">
          <a class="btn btn-wa" style="margin:0" target="_blank" rel="noopener" href="https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(waText(entry))}">Konfirmasi lewat WhatsApp</a>
          <button class="btn btn-ghost" type="button" onclick="window.print()">Cetak / simpan PDF</button>
          <a class="btn btn-ghost" href="produk.html">Buat penawaran baru</a>
        </div>
      </div>`;
    renderHistory();
    window.scrollTo({ top: 0 });
    toast(`Permintaan ${entry.number} terkirim`);
  }

  function renderHistory() {
    const h = Store.history();
    $("q-history").hidden = h.length === 0;
    $("q-history-rows").innerHTML = h.map((e) => `<tr>
      <td><strong>${e.number}</strong></td>
      <td>${new Date(e.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td>
      <td class="num">${e.lines.length}</td>
      <td class="num">${fmtIDR(e.totals.total)}</td>
      <td>${e.status}</td></tr>`).join("");
  }

  render();
});
