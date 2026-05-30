document.addEventListener("DOMContentLoaded", () => {
  const moon = document.getElementById("moon");
  const moonText = document.getElementById("moon-text");

  function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent =
      now.toLocaleTimeString("vi-VN", { hour12: false });
  }

  updateClock();
  setInterval(updateClock, 1000);

  function getJulianDate(date = new Date()) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  const NEW_MOON_JD = 2451550.1;
  const SYNODIC_MONTH = 29.530588853;

  function updateMoon(date = new Date()) {
    const jd = getJulianDate(date);

    let age = (jd - NEW_MOON_JD) % SYNODIC_MONTH;
    if (age < 0) age += SYNODIC_MONTH;

    const phase = age / SYNODIC_MONTH;

    // ====== 🌕 SHADOW (KHỚP CSS TRANSLATE) ======
    // 0 = trăng non (đen kín)
    // 1 = trăng tròn (không che)
    const distanceToFull = Math.abs(phase - 0.5) * 2;
    const shadow = 1 - distanceToFull;

    const isFullMoon = distanceToFull < 0.05;

    moon.style.setProperty("--shadow", shadow);
    moon.dataset.full = isFullMoon ? "1" : "0"
    // ====== 📝 TEXT LOGIC CHUẨN ======
    

    let text = "";

    if (phase < 0.03 || phase > 0.97) {
      text = "Trăng non";
    } else if (distanceToFull < 0.08) {
      text = "Trăng tròn";
    } else if (phase < 0.5) {
      text = "Trăng đang lớn";
    } else {
      text = "Trăng đang khuyết";
    }

    moonText.textContent = text;
  }

  updateMoon();
});