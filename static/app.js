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

    // ====== TÍNH TOÁN BÓNG CHE INSET (LƯỠI LIỀM NGHỆ THUẬT) ======
    
    let insetX = 0;
    let blurRad = 0;
    let shadowColor = "rgba(17, 17, 17, 0.95)"; // Màu bóng tối

    // Tính tỷ lệ phần trăm bề mặt được chiếu sáng thực tế (từ 0 đến 1)
    // Sử dụng hàm cos để mô phỏng bề mặt cầu của mặt trăng
    const illumination = (1 + Math.cos(phase * 2 * Math.PI + Math.PI)) / 2;

    if (phase <= 0.5) {
      // Nửa đầu tháng (Trăng lớn dần): Bên phải sáng, bóng che lùi dần sang phải
      // Khi mới là trăng non (phase = 0), insetX = 0 (che hết). Khi trăng tròn (phase = 0.5), insetX = 200 (lùi hết ra ngoài)
      insetX = (1 - illumination) * 200;
    } else {
      // Nửa cuối tháng (Trăng khuyết dần - Hiện tại của bạn): Bên trái sáng, bóng tiến vào từ bên phải
      // Khi vừa qua rằm, illumination giảm nhẹ từ 1 xuống -> insetX sẽ mang giá trị âm nhỏ (bóng mới chớm vào từ bên phải)
      insetX = -(1 - illumination) * 200;
    }

    // Truyền giá trị tính toán được sang CSS Variables
    moon.style.setProperty("--inset-x", `${insetX}px`);
    moon.style.setProperty("--phase", phase);

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
      text = "Trăng đang lớn";
    } else {
      text = "Trăng đang khuyết";
    }
    moonText.textContent = text;
  }

  updateMoon();
});