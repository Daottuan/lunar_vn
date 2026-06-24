document.addEventListener("DOMContentLoaded", () => {
  const moon = document.getElementById("moon");
  const moonText = document.getElementById("moon-text");

  // Hàm đồng hồ (Đã được tối ưu để độc lập, không bị ảnh hưởng bởi logic khác)
  function updateClock() {
    const clockEl = document.getElementById("clock");
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString("vi-VN", { hour12: false });
    }
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

    // ====== TÍNH TOÁN BÓNG CHE INSET (ĐÃ ĐƯỢC ĐIỀU CHỈNH TỶ LỆ) ======
    let insetX = 0;
    const maxShift = 115; // Tăng nhẹ từ 100 lên 115 để bù trừ 15px blur của CSS, giúp che sạch khi trăng non

    if (phase <= 0.5) {
      // Nửa đầu tháng (Trăng lớn dần): Bên phải sáng, bóng che lùi dần sang phải
      // Tỷ lệ đi từ maxShift (che hết) về 0 (không che - trăng tròn)
      const progress = phase / 0.5; 
      insetX = (1 - progress) * maxShift;
    } else {
      // Nửa cuối tháng (Trăng khuyết dần - Trạng thái ngày 22 AL của bạn): 
      // Bên trái sáng, bóng tiến vào từ bên phải mang giá trị âm
      // Tỷ lệ đi từ 0 (trăng tròn) tiến dần đến -maxShift (che hết khi hết tháng)
      const progress = (phase - 0.5) / 0.5;
      insetX = -progress * maxShift;
    }

    // Truyền giá trị tính toán được sang CSS Variables
    moon.style.setProperty("--inset-x", `${insetX}px`);
    moon.style.setProperty("--phase", phase);

    // ====== CÁC LOGIC HIỂN THỊ CHỮ (GIỮ NGUYÊN) ======
    const distanceToFull = Math.abs(phase - 0.5) * 2;
    const isFullMoon = distanceToFull < 0.05;
    moon.dataset.full = isFullMoon ? "1" : "0";

    let text = "";
    if (phase < 0.03 || phase > 0.97) {
      text = "Trăng non";
    } else if (distanceToFull < 0.08) {
      text = "Trăng tròn";
    } else if (phase < 0.5) {
      text = "Trăng đang tròn";
    } else {
      text = "Trăng đang khuyết";
    }
    moonText.textContent = text;
  }

  updateMoon();
});