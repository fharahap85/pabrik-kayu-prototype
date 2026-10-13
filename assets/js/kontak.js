/* Kontak: info, status buka/tutup, formulir, FAQ */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.getElementById(s);

  $("c-address").textContent = COMPANY.address;
  $("c-phone").textContent = COMPANY.phone;
  $("c-phone").href = `tel:${COMPANY.phone.replace(/-/g, "")}`;
  $("c-email").textContent = COMPANY.email;
  $("c-email").href = `mailto:${COMPANY.email}`;
  $("c-wa").href = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Halo, saya ingin bertanya tentang produk kayu.")}`;
  const d = 0.012;
  $("c-map").src = `https://www.openstreetmap.org/export/embed.html?bbox=${COMPANY.mapLng - d},${COMPANY.mapLat - d},${COMPANY.mapLng + d},${COMPANY.mapLat + d}&layer=mapnik&marker=${COMPANY.mapLat},${COMPANY.mapLng}`;

  /* Status buka/tutup berdasarkan waktu WIB (UTC+7) */
  function openStatus() {
    const now = new Date();
    const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 420) * 60000);
    const mins = wib.getHours() * 60 + wib.getMinutes();
    const [oh, om] = COMPANY.hours.open.split(":").map(Number);
    const [ch, cm] = COMPANY.hours.close.split(":").map(Number);
    const isOpen = COMPANY.hours.days.includes(wib.getDay()) && mins >= oh * 60 + om && mins < ch * 60 + cm;
    const el = $("open-status");
    el.className = "open-status " + (isOpen ? "is-open" : "is-closed");
    el.textContent = isOpen ? `Buka sekarang, tutup pukul ${COMPANY.hours.close.replace(":", ".")} WIB` : "Sedang tutup. Pesan tetap bisa dikirim lewat formulir.";
  }
  openStatus();
  setInterval(openStatus, 60000);

  /* Formulir */
  const rules = {
    "k-name": (v) => v.trim().length >= 2,
    "k-email": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    "k-msg": (v) => v.trim().length >= 10,
  };
  const check = (id) => {
    const ok = rules[id]($(id).value);
    $(id).closest(".field").classList.toggle("invalid", !ok);
    $(id).setAttribute("aria-invalid", !ok);
    return ok;
  };
  Object.keys(rules).forEach((id) => $(id).addEventListener("input", () => $(id).closest(".field").classList.remove("invalid")));

  $("contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = Object.keys(rules).filter((id) => !check(id));
    if (bad.length) { $(bad[0]).focus(); return; }
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Mengirim…";
    // Simulasi — ganti dengan fetch() ke backend
    setTimeout(() => {
      const name = $("k-name").value.trim();
      e.target.hidden = true;
      const box = $("contact-success");
      box.hidden = false;
      box.innerHTML = `<div class="success" style="margin:0">
        <span class="stamp">Terkirim</span>
        <h2>Pesan Anda sudah kami terima</h2>
        <p>Terima kasih, ${esc(name)}. Kami akan membalas ke ${esc($("k-email").value.trim())} pada jam kerja berikutnya.</p>
        <button class="btn btn-ghost" type="button" id="again">Kirim pesan lain</button></div>`;
      $("again").addEventListener("click", () => {
        e.target.reset();
        e.target.hidden = false;
        btn.disabled = false;
        btn.textContent = "Kirim pesan";
        box.hidden = true;
        $("k-name").focus();
      });
      toast("Pesan terkirim");
    }, 600);
  });

  /* FAQ */
  $("faq").innerHTML = FAQ.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
});
