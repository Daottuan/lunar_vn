document.addEventListener("DOMContentLoaded", () => {
  const moon = document.getElementById("moon");
  const moonText = document.getElementById("moon-text");

  // Hàm đồng hồ độc lập
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

    let insetX = 0;
    const maxShift = 115;

    if (phase <= 0.5) {
      const progress = phase / 0.5; 
      insetX = (1 - progress) * maxShift;
    } else {
      const progress = (phase - 0.5) / 0.5;
      insetX = -progress * maxShift;
    }

    moon.style.setProperty("--inset-x", `${insetX}px`);
    moon.style.setProperty("--phase", phase);

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

  // =========================================================================
  // LOGIC ĐỒNG BỘ LỊCH ÂM CHUẨN XÁC TỪ BẢN ĐỒ BACKEND (THAY THẾ HÀM TÍNH SAI CŨ)
  // =========================================================================
  function getLunarKeyForDate(targetDate) {
    const d = targetDate.getDate();
    const m = targetDate.getMonth() + 1;
    const y = targetDate.getFullYear();
    
    // Tra cứu dữ liệu ngày dương từ bản đồ chính xác tuyệt đối của backend lunardate
    const mapKey = `${y}-${m}-${d}`;
    const lunarInfo = window.LUNAR_MAP_DATA?.solar_lunar_map?.[mapKey];
    
    if (lunarInfo) {
      const suffix = lunarInfo.isLeap ? "NAL" : "AL";
      return `${String(lunarInfo.day).padStart(2, '0')}${String(lunarInfo.month).padStart(2, '0')}${suffix}`;
    }
    return null;
  }

  // ==========================================
  // LOGIC HIỂN THỊ VÀ TRƯỢT XEM CÁC THÁNG
  // ==========================================
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarTitle = document.getElementById("calendar-title");

  const todayObj = new Date();
  const currentDay = todayObj.getDate();
  const currentMonth = todayObj.getMonth() + 1;
  const currentYear = todayObj.getFullYear();

  let viewMonth = currentMonth;
  let viewYear = currentYear;

  function renderCalendar(year, month) {
    if (!calendarGrid || !calendarTitle) return;
    calendarGrid.innerHTML = "";
    
    calendarTitle.textContent = `Tháng ${month} / ${year}`;

    const weekdaysLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    weekdaysLabels.forEach((label, index) => {
      const labelBox = document.createElement("div");
      labelBox.className = "weekday-label";
      labelBox.style.fontWeight = "600";
      labelBox.style.fontSize = "13px";
      labelBox.style.paddingBottom = "5px";
      labelBox.style.textAlign = "center";
      
      if (index === 5) {
        labelBox.style.color = "#eab308"; 
      } else if (index === 6) {
        labelBox.style.color = "#ef4444"; 
      } else {
        labelBox.style.color = "#9ca3af"; 
      }
      
      labelBox.textContent = label;
      calendarGrid.appendChild(labelBox);
    });

    const firstDayIdx = new Date(year, month - 1, 1).getDay();
    const totalDays = new Date(year, month, 0).getDate();
    const startOffset = firstDayIdx === 0 ? 6 : firstDayIdx - 1;

    for (let i = 0; i < startOffset; i++) {
      const emptyBox = document.createElement("div");
      emptyBox.className = "day empty";
      emptyBox.style.opacity = "0";
      calendarGrid.appendChild(emptyBox);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dayBox = document.createElement("div");
      dayBox.className = "day";

      if (day === currentDay && month === currentMonth && year === currentYear) {
        dayBox.classList.add("today");
      }

      const thisDate = new Date(year, month - 1, day);
      const dayOfWeek = thisDate.getDay(); 

      if (dayOfWeek === 0) {
        dayBox.style.color = "#ef4444"; 
      } else if (dayOfWeek === 6) {
        dayBox.style.color = "#eab308"; 
      }

      const lunarKey = getLunarKeyForDate(thisDate);
      let lDisplay = "";
      let isSpecialLunar = false;

      if (lunarKey) {
        const lDay = parseInt(lunarKey.substring(0, 2), 10);
        const lMonth = parseInt(lunarKey.substring(2, 4), 10);
        const isLeap = lunarKey.endsWith("NAL");

        if (lDay === 1) {
          lDisplay = `${lDay}/${lMonth}${isLeap ? 'N' : ''}`;
          isSpecialLunar = true;
        } else if (lDay === 15) {
          lDisplay = "15";
          isSpecialLunar = true;
        } else {
          lDisplay = String(lDay);
        }
      } else {
        lDisplay = "-";
      }

      // Đã sửa lại chính xác biến thành lDisplay ở dòng dưới
      dayBox.innerHTML = `
        <div class="solar-num" style="font-weight: 700; font-size: 15px;">${day}</div>
        <div class="lunar-num" style="font-size: 10px; opacity: 0.7; margin-top: 2px; color: ${isSpecialLunar ? (lDisplay.includes('/') ? '#ffcc66' : '#66d9ff') : 'inherit'}">${lDisplay}</div>
      `;
      calendarGrid.appendChild(dayBox);
    }
  }

  window.changeMonth = function(direction) {
    viewMonth += direction;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear++;
    } else if (viewMonth < 1) {
      viewMonth = 12;
      viewYear--;
    }
    renderCalendar(viewYear, viewMonth);
    calendarGrid.style.display = "grid";
  };

  if (calendarTitle) {
    calendarTitle.style.padding = "5px 20px";
    calendarTitle.addEventListener("click", (e) => {
      e.stopPropagation(); 
      const currentDisplay = window.getComputedStyle(calendarGrid).display;
      if (currentDisplay === "none") {
        calendarGrid.style.display = "grid";
      } else {
        calendarGrid.style.display = "none";
      }
    });
  }

  let touchStartX = 0;
  let touchEndX = 0;
  const calendarContainer = document.querySelector(".calendar");

  if (calendarContainer) {
    calendarContainer.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    calendarContainer.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    }, { passive: true });
  }

  function handleSwipeGesture() {
    const currentDisplay = window.getComputedStyle(calendarGrid).display;
    if (currentDisplay === "none") return;

    const swipeThreshold = 50; 
    const diffX = touchEndX - touchStartX;

    if (Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        window.changeMonth(-1); 
      } else {
        window.changeMonth(1);  
      }
    }
  }

  // Khởi tạo hiển thị lịch tháng gốc
  renderCalendar(viewYear, viewMonth);
  calendarGrid.style.display = "none"; 
});