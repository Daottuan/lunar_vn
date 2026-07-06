document.addEventListener("DOMContentLoaded", () => {
  const moon = document.getElementById("moon");
  const moonText = document.getElementById("moon-text");
  const datePicker = document.getElementById("date-picker");
  const btnToday = document.getElementById("btn-today");

  // Các phần tử hiển thị thông tin đỉnh Card để cập nhật động khi đổi ngày
  const solarEl = document.querySelector(".solar");
  const lunarEl = document.querySelector(".lunar");
  const canchiEl = document.querySelector(".canchi");
  const holidayEl = document.querySelector(".holiday");
  const titleYearEl = document.querySelector(".title-year");
  const bodyEl = document.body;

  // Lưu trữ dữ liệu gốc lúc tải trang từ Backend làm Fallback
  const ORIGINAL_BACKEND_DATA = window.LUNAR_MAP_DATA ? JSON.parse(JSON.stringify(window.LUNAR_MAP_DATA)) : {};

  // Mảng định nghĩa Thập Thiên Can và Thập Nhị Địa Chi
  const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
  const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

  // =========================================================================
  // KHU VỰC ĐỒNG BỘ MỐC THỜI GIAN THỰC TỪ BACKEND PYTHON
  // =========================================================================
  const baseSource = window.LUNAR_MAP_DATA || {};
  let todayDate = new Date(); 

  if (baseSource && baseSource["Dương_lịch"]) {
    const parts = baseSource["Dương_lịch"].split('/');
    if (parts.length === 3) {
      // Thiết lập ngày chuẩn của hệ thống Việt Nam tại múi giờ địa phương
      todayDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0);
    }
  }

  const currentDay = todayDate.getDate();
  const currentMonth = todayDate.getMonth() + 1;
  const currentYear = todayDate.getFullYear();

  let viewMonth = currentMonth;
  let viewYear = currentYear;

  // =========================================================================
  // THUẬT TOÁN TÍNH TOÁN CAN CHI CHUẨN MÚI GIỜ VIỆT NAM (HOÀN TOÀN CHÍNH XÁC)
  // =========================================================================
  function getJulianDate(date) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    
    let a = Math.floor((14 - m) / 12);
    let y_prime = y + 4800 - a;
    let m_prime = m + 12 * a - 3;
    
    // Thuật toán chuẩn tính số ngày Julius cho lịch Gregory
    let jd = d + Math.floor((153 * m_prime + 2) / 5) + 365 * y_prime + Math.floor(y_prime / 4) - Math.floor(y_prime / 100) + Math.floor(y_prime / 400) - 32045;
    return jd;
  }

  function computeCanChi(targetDate, lunarDay, lunarMonth, lunarYear) {
    // Tính toán Can Chi của Ngày dựa theo số ngày Julius chuẩn
    const jd = getJulianDate(targetDate);
    
    const canDayIdx = (jd + 9) % 10;
    const chiDayIdx = (jd + 1) % 12;
    const canChiDay = `${CAN[canDayIdx]} ${CHI[chiDayIdx]}`;

    // Tính Can Chi của Năm Âm Lịch
    const canYearIdx = (lunarYear - 4) % 10;
    const chiYearIdx = (lunarYear - 4) % 12;
    const canChiYear = `${CAN[canYearIdx < 0 ? canYearIdx + 10 : canYearIdx]} ${CHI[chiYearIdx < 0 ? chiYearIdx + 12 : chiYearIdx]}`;

    // Tính Can Chi của Tháng Âm Lịch
    const monthCanStart = (((lunarYear - 4) % 10) * 2 + 2) % 10;
    const canMonthIdx = (monthCanStart + lunarMonth - 1) % 10;
    const chiMonthIdx = (lunarMonth + 1) % 12;
    const canChiMonth = `${CAN[canMonthIdx]} ${CHI[chiMonthIdx]}`;

    return {
      day: canChiDay,
      month: canChiMonth,
      year: canChiYear
    };
  }

  // Hàm đồng hồ tự động
  function updateClock() {
    const clockEl = document.getElementById("clock");
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString("vi-VN", { hour12: false });
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  const NEW_MOON_JD = 2451550.1;
  const SYNODIC_MONTH = 29.530588853;

  function updateMoon(date = new Date()) {
    if (!moon) return;
    const jd = getJulianDate(date);
    let age = (jd - NEW_MOON_JD) % SYNODIC_MONTH;
    if (age < 0) age += SYNODIC_MONTH;

    const phase = age / SYNODIC_MONTH;
    let insetX = 0;
    const maxShift = 115;

    if (phase <= 0.5) {
      insetX = (1 - (phase / 0.5)) * maxShift;
    } else {
      insetX = -((phase - 0.5) / 0.5) * maxShift;
    }

    moon.style.setProperty("--inset-x", `${insetX}px`);
    moon.style.setProperty("--phase", phase);

    const distanceToFull = Math.abs(phase - 0.5) * 2;
    if (moonText) {
      if (phase < 0.03 || phase > 0.97) moonText.textContent = "Trăng non";
      else if (distanceToFull < 0.08) moonText.textContent = "Trăng tròn";
      else if (phase < 0.5) moonText.textContent = "Trăng đang tròn";
      else moonText.textContent = "Trăng đang khuyết";
    }
  }

  // =========================================================================
  // CHUẨN HÓA LOGIC TRA CỨU BẢN ĐỒ BACKEND (SỬA ĐỂ TÌM ĐÚNG KEY PHÍA PYTHON)
  // =========================================================================
  function getLunarDataFromMap(targetDate) {
    if (!window.LUNAR_MAP_DATA?.solar_lunar_map) return null;
  
    const d = String(targetDate.getDate()).padStart(2, '0');
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    const y = targetDate.getFullYear();
  
    // Đa dạng hóa các định dạng Key giúp JS khớp hoàn toàn với cấu trúc JSON của file Python
    const k1 = `${y}-${m}-${d}`; 
    const k2 = `${y}-${targetDate.getMonth() + 1}-${targetDate.getDate()}`;
    const k3 = `${y}-${m}-${targetDate.getDate()}`;
    const k4 = `${y}-${targetDate.getMonth() + 1}-${d}`;
  
    const map = window.LUNAR_MAP_DATA.solar_lunar_map;
    return map[k1] || map[k2] || map[k3] || map[k4] || null;
  }

  function getLunarKeyForDate(targetDate) {
    const lunarInfo = getLunarDataFromMap(targetDate);
    if (lunarInfo) {
      const suffix = lunarInfo.isLeap || lunarInfo.is_leap_month ? "NAL" : "AL";
      return `${String(lunarInfo.day).padStart(2, '0')}${String(lunarInfo.month).padStart(2, '0')}${suffix}`;
    }
    return null;
  }

  // =========================================================================
  // LOGIC HIỂN THỊ VÀ TRƯỢT XEM CÁC THÁNG
  // =========================================================================
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarTitle = document.getElementById("calendar-title");

  function renderCalendar(year, month) {
    if (!calendarGrid || !calendarTitle) return;
    calendarGrid.innerHTML = "";
    calendarTitle.textContent = `Tháng ${month} / ${year}`;

    if (btnToday) {
      btnToday.style.display = (year === currentYear && month === currentMonth) ? "none" : "inline-block";
    }

    const weekdaysLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    weekdaysLabels.forEach((label, index) => {
      const labelBox = document.createElement("div");
      labelBox.className = "weekday-label";
      labelBox.style.fontWeight = "600";
      labelBox.style.fontSize = "13px";
      labelBox.style.paddingBottom = "5px";
      labelBox.style.textAlign = "center";
      labelBox.style.color = index === 5 ? "#eab308" : (index === 6 ? "#ef4444" : "#9ca3af");
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
      dayBox.style.position = "relative";

      if (day === currentDay && month === currentMonth && year === currentYear) {
        dayBox.classList.add("today");
      }

      const thisDate = new Date(year, month - 1, day);
      const dayOfWeek = thisDate.getDay(); 
      if (dayOfWeek === 0) dayBox.style.color = "#ef4444";
      else if (dayOfWeek === 6) dayBox.style.color = "#eab308";

      const lunarKey = getLunarKeyForDate(thisDate);
      let lDisplay = "-";
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
      }

      dayBox.innerHTML = `
        <div class="solar-num" style="font-weight: 700; font-size: 15px;">${day}</div>
        <div class="lunar-num" style="font-size: 10px; opacity: 0.7; margin-top: 2px; color: ${isSpecialLunar ? (lDisplay.includes('/') ? '#ffcc66' : '#66d9ff') : 'inherit'}">${lDisplay}</div>
      `;

      const dayDataFromMap = getLunarDataFromMap(thisDate);
      if (dayDataFromMap && dayDataFromMap.hasEvent) {
          dayBox.classList.add('has-event');
          let emojiString = ""; 
          if (dayDataFromMap.Holiday) emojiString += "🎉";
          if (dayDataFromMap.Tiết_khí) emojiString += "🌤";
          if (emojiString !== "") {
              dayBox.insertAdjacentHTML('beforeend', `<span class="grid-event-icon">${emojiString}</span>`);
          }
      }

      dayBox.addEventListener("click", () => {
        const previousSelected = calendarGrid.querySelector(".day.selected-day");
        if (previousSelected) previousSelected.classList.remove("selected-day");
        dayBox.classList.add("selected-day");
        updateTopCardInfo(thisDate);
        updateMoon(thisDate);
      });

      calendarGrid.appendChild(dayBox);
    }
  }

  function updateTopCardInfo(targetDate) {
    if (!targetDate || isNaN(targetDate.getTime())) return;
    const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    
    const d = targetDate.getDate();
    const m = targetDate.getMonth() + 1;
    const y = targetDate.getFullYear();

    if (solarEl) solarEl.innerHTML = `📅 ${daysOfWeek[targetDate.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y} 📅`;

    const dayData = getLunarDataFromMap(targetDate);

    let lDay = d, lMonth = m, lYear = y, isLeap = false;
    if (dayData) {
      lDay = dayData.day;
      lMonth = dayData.month;
      lYear = dayData.lunar_year || dayData.year || y; 
      isLeap = dayData.isLeap || dayData.is_leap_month;
    } else if (d === currentDay && m === currentMonth && y === currentYear) {
      lDay = ORIGINAL_BACKEND_DATA.day || d;
      lMonth = ORIGINAL_BACKEND_DATA.month || m;
      lYear = ORIGINAL_BACKEND_DATA.year || y;
      isLeap = ORIGINAL_BACKEND_DATA["Tháng_nhuận"] || ORIGINAL_BACKEND_DATA.is_leap_month;
    }

    // Ưu tiên trích xuất Can chi đồng bộ có sẵn từ Python
    const computed = computeCanChi(targetDate, lDay, lMonth, lYear);
    let canChiDay = computed.day;
    let canChiMonth = computed.month;
    let canChiYear = computed.year;

    if (titleYearEl) titleYearEl.textContent = `${y} ${canChiYear}`;
    if (lunarEl) lunarEl.innerHTML = `${String(lDay).padStart(2, '0')}/${String(lMonth).padStart(2, '0')} ${isLeap ? '<span class="leap-badge">N</span>' : ''}AL`;
    if (bodyEl) bodyEl.setAttribute("data-lunar-day", lDay);

    if (canchiEl) {
      canchiEl.innerHTML = `
        <div>Ngày: ${canChiDay}</div>
        <div>Tháng: ${canChiMonth}</div>
        <div>Năm: ${canChiYear}</div>
      `;
    }

    if (holidayEl) {
      let hHtml = "";
      const holidayVal = (d === currentDay && m === currentMonth && y === currentYear) ? ORIGINAL_BACKEND_DATA.Holiday : (dayData?.Holiday || dayData?.holiday);
      const tietKhiVal = (d === currentDay && m === currentMonth && y === currentYear) ? ORIGINAL_BACKEND_DATA["Tiết_khí"] : (dayData?.["Tiết_khí"] || dayData?.["tiet_khi"]);
      
      if (holidayVal) hHtml += `<div class="holiday-item"><span class="icon">🎉</span><span class="text">${holidayVal}</span></div>`;
      if (tietKhiVal) hHtml += `<div class="holiday-item"><span class="icon">🌤</span><span class="text">${tietKhiVal}</span></div>`;
      holidayEl.innerHTML = hHtml;
    }
  }

  // =========================================================================
  // KHỞI CHẠY KHỞI TẠO ĐỒNG BỘ BAN ĐẦU
  // =========================================================================
  renderCalendar(viewYear, viewMonth);
  updateTopCardInfo(todayDate);
  updateMoon(todayDate);

  // =========================================================================
  // CÁC SỰ KIỆN ĐIỀU HƯỚNG NÚT BẤM KHÁC
  // =========================================================================
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
      calendarGrid.style.display = currentDisplay === "none" ? "grid" : "none";
    });
  }

  if (datePicker) {
    datePicker.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      
      const inputVal = datePicker.value.trim();
      if (!inputVal) return;

      let targetDate = null;
      const today = new Date();

      if (/^\d+$/.test(inputVal)) {
        if (inputVal.length === 8) { 
          const d = parseInt(inputVal.substring(0, 2), 10);
          const m = parseInt(inputVal.substring(2, 4), 10);
          const y = parseInt(inputVal.substring(4, 8), 10);
          targetDate = new Date(y, m - 1, d);
        } else if (inputVal.length === 4) { 
          const d = parseInt(inputVal.substring(0, 2), 10);
          const m = parseInt(inputVal.substring(2, 4), 10);
          targetDate = new Date(today.getFullYear(), m - 1, d);
        }
      } else { 
        const parts = inputVal.split(/[\/\-\.]/);
        if (parts.length >= 2) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const y = parts[2] ? parseInt(parts[2], 10) : today.getFullYear();
          targetDate = new Date(y, m - 1, d);
        }
      }

      if (targetDate && !isNaN(targetDate.getTime())) {
        viewYear = targetDate.getFullYear();
        viewMonth = targetDate.getMonth() + 1;

        renderCalendar(viewYear, viewMonth);
        calendarGrid.style.display = "grid";
        
        updateMoon(targetDate);
        updateTopCardInfo(targetDate);
        
        datePicker.value = `${String(targetDate.getDate()).padStart(2, '0')}/${String(viewMonth).padStart(2, '0')}/${viewYear}`;
        datePicker.blur(); 
      } else {
        alert("Ngày nhập vào chưa đúng định dạng. Vui lòng nhập lại!");
      }
    });
  }

  if (btnToday) {
    btnToday.addEventListener("click", () => {
      viewYear = currentYear;
      viewMonth = currentMonth;
      
      renderCalendar(viewYear, viewMonth);
      calendarGrid.style.display = "grid";

      updateTopCardInfo(todayDate);
      updateMoon(todayDate);
    });
  }
});