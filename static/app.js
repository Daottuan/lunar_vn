document.addEventListener("DOMContentLoaded", () => {
  const moon = document.getElementById("moon");
  const moonText = document.getElementById("moon-text");

  function updateClock() {
      const now = new Date();
      document.getElementById("clock").textContent =
        now.toLocaleTimeString("vi-VN", { hour12: false });
  }
    
  updateClock(); // chạy ngay khi mở trang
  setInterval(updateClock, 1000);

  function getJulianDate(date = new Date()) {
    return date / 86400000 + 2440587.5;
  }

  const NEW_MOON_JD = 2451550.1;
  const SYNODIC_MONTH = 29.530588853;

  function updateMoon(date = new Date()) {
    const jd = getJulianDate(date);

    let age = (jd - NEW_MOON_JD) % SYNODIC_MONTH;
    if (age < 0) age += SYNODIC_MONTH;

    const phase = age / SYNODIC_MONTH;

    let shadow = 0;
    let text = "";

    if (phase < 0.03 || phase > 0.97) {
      shadow = 0;
      text = "Trăng non";
    } else if (phase < 0.5) {
      shadow = phase * 60;
      text = "Trăng đang tròn";
    } else if (Math.abs(phase - 0.5) < 0.03) {
      shadow = phase * 60;
      text = "Trăng tròn";
    } else {
      shadow = (1 - phase) * 160;
      text = "Trăng đang khuyết";
    }

    moon.style.setProperty("--shadow-pos", `${60 - shadow}px`);
    moonText.textContent = text;
  }

  updateMoon();
});