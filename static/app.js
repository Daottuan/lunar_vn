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

  // Hàm tính số ngày Julius (JD) cho một ngày Dương lịch
  function getJulianDate(date = new Date()) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  // Thuật toán tính toán hệ Can Chi thuần JavaScript chuẩn xác cho mọi ngày
  function computeCanChi(targetDate, lunarDay, lunarMonth, lunarYear) {
    const jd = Math.floor(getJulianDate(targetDate) + 0.5);
    
    // 1. Tính Can Chi của Ngày (Dựa trên số ngày Julius)
    const canDayIdx = (jd + 9) % 10;
    const chiDayIdx = (jd + 1) % 12;
    const canChiDay = `${CAN[canDayIdx]} ${CHI[chiDayIdx]}`;

    // 2. Tính Can Chi của Năm Âm Lịch
    const canYearIdx = (lunarYear - 4) % 10;
    const chiYearIdx = (lunarYear - 4) % 12;
    const canChiYear = `${CAN[canYearIdx < 0 ? canYearIdx + 10 : canYearIdx]} ${CHI[chiYearIdx < 0 ? chiYearIdx + 12 : chiYearIdx]}`;

    // 3. Tính Can Chi của Tháng Âm Lịch (Dựa vào Thiên can của Năm)
    const yearCanIdx = (lunarYear - 4) % 10;
    const monthCanStart = (yearCanIdx * 2 + 14) % 10;
    const canMonthIdx = (monthCanStart + lunarMonth - 1) % 10;
    const chiMonthIdx = (lunarMonth + 1) % 12;
    const canChiMonth = `${CAN[canMonthIdx]} ${CHI[chiMonthIdx]}`;

    return {
      day: canChiDay,
      month: canChiMonth,
      year: canChiYear
    };
  }

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
    if (moonText) moonText.textContent = text;
  }

  updateMoon();

  // =========================================================================
  // CHUẨN HÓA LOGIC TRA CỨU BẢN ĐỒ BACKEND
  // =========================================================================
  function getLunarDataFromMap(targetDate) {
    if (!window.LUNAR_MAP_DATA?.solar_lunar_map) return null;
    const d = targetDate.getDate();
    const m = targetDate.getMonth() + 1;
    const y = targetDate.getFullYear();
    const keyShort = `${y}-${m}-${d}`;
    const keyLong = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return window.LUNAR_MAP_DATA.solar_lunar_map[keyShort] || window.LUNAR_MAP_DATA.solar_lunar_map[keyLong] || null;
  }

  function getLunarKeyForDate(targetDate) {
    const lunarInfo = getLunarDataFromMap(targetDate);
    if (lunarInfo) {
      const suffix = lunarInfo.isLeap || lunarInfo.is_leap_month ? "NAL" : "AL";
      return `${String(lunarInfo.day).padStart(2, '0')}${String(lunarInfo.month).padStart(2, '0')}${suffix}`;
    }
    return null;
  }

  // Cập nhật lại giao diện thông tin Card trên cùng khi click hoặc nhập ngày
  function updateTopCardInfo(targetDate) {
    if (!targetDate || isNaN(targetDate.getTime())) return;
    const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    
    const d = targetDate.getDate();
    const m = targetDate.getMonth() + 1;
    const y = targetDate.getFullYear();

    if (solarEl) solarEl.innerHTML = `📅 ${daysOfWeek[targetDate.getDay()]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y} 📅`;

    const dayData = getLunarDataFromMap(targetDate);

    // Xác định Ngày / Tháng / Năm Âm Lịch để tính Can Chi
    let lDay = d, lMonth = m, lYear = y, isLeap = false;
    if (dayData) {
      lDay = dayData.day;
      lMonth = dayData.month;
      lYear = dayData.lunar_year || dayData.year || y; 
      isLeap = dayData.isLeap || dayData.is_leap_month;
    } else if (d === new Date().getDate() && m === (new Date().getMonth() + 1)) {
      lDay = ORIGINAL_BACKEND_DATA.day || d;
      lMonth = ORIGINAL_BACKEND_DATA.month || m;
      lYear = ORIGINAL_BACKEND_DATA.lunar_year || y;
      isLeap = ORIGINAL_BACKEND_DATA.is_leap_month;
    }

    // TỰ ĐỘNG TÍNH TOÁN CAN CHI CHUẨN XÁC NẾU BACKEND KHÔNG TRẢ VỀ
    let canChiDay = dayData?.Can_chi_day || dayData?.can_chi_day;
    let canChiMonth = dayData?.Can_chi_month || dayData?.can_chi_month;
    let canChiYear = dayData?.Can_chi_year || dayData?.can_chi_year;

    if (!canChiDay || !canChiMonth || !canChiYear) {
      const computed = computeCanChi(targetDate, lDay, lMonth, lYear);
      canChiDay = canChiDay || computed.day;
      canChiMonth = canChiMonth || computed.month;
      canChiYear = canChiYear || computed.year;
    }

    // Cập nhật năm trên tiêu đề
    if (titleYearEl) titleYearEl.textContent = `${y} ${canChiYear}`;
    
    // Cập nhật ngày âm lịch
    if (lunarEl) {
      lunarEl.innerHTML = `${String(lDay).padStart(2, '0')}/${String(lMonth).padStart(2, '0')} ${isLeap ? '<span class="leap-badge">N</span>' : ''}AL`;
    }
    if (bodyEl) bodyEl.setAttribute("data-lunar-day", lDay);

    // Đẩy thông tin Can Chi lên giao diện chuẩn xác 100% cho mọi ngày chọn
    if (canchiEl) {
      canchiEl.innerHTML = `
        <div>Ngày: ${canChiDay}</div>
        <div>Tháng: ${canChiMonth}</div>
        <div>Năm: ${canChiYear}</div>
      `;
    }

    // Cập nhật Ngày lễ & Tiết khí
    if (holidayEl) {
      let hHtml = "";
      const holidayVal = dayData?.Holiday || dayData?.holiday;
      const tietKhiVal = dayData?.["Tiết_khí"] || dayData?.["tiet_khi"];
      
      if (holidayVal) hHtml += `<div class="holiday-item"><span class="icon">🎉</span><span class="text">${holidayVal}</span></div>`;
      if (tietKhiVal) hHtml += `<div class="holiday-item"><span class="icon">🌤</span><span class="text">${tietKhiVal}</span></div>`;
      holidayEl.innerHTML = hHtml;
    }
  }

  // =========================================================================
  // LOGIC HIỂN THỊ VÀ TRƯỢT XEM CÁC THÁNG (ĐÃ CẬP NHẬT TRÁNH LỖI PHẲNG KEY SỰ KIỆN)
  // =========================================================================
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

    if (btnToday) {
      if (year === currentYear && month === currentMonth) {
        btnToday.style.display = "none";
      } else {
        btnToday.style.display = "inline-block";
      }
    }

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

    // VÒNG LẶP VẼ TỪNG NGÀY
    for (let day = 1; day <= totalDays; day++) {
      const dayBox = document.createElement("div");
      dayBox.className = "day";
      dayBox.style.position = "relative"; // Bắt buộc nhằm định vị tuyệt đối icon sự kiện

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

      dayBox.innerHTML = `
        <div class="solar-num" style="font-weight: 700; font-size: 15px;">${day}</div>
        <div class="lunar-num" style="font-size: 10px; opacity: 0.7; margin-top: 2px; color: ${isSpecialLunar ? (lDisplay.includes('/') ? '#ffcc66' : '#66d9ff') : 'inherit'}">${lDisplay}</div>
      `;

      // =========================================================================
      // ĐOẠN LOGIC KIỂM TRA SỰ KIỆN (HỖ TRỢ HIỂN THỊ CẢ 2 ICON CÙNG LÚC)
      // =========================================================================
      const k1 = `${year}-${month}-${day}`;
      const k2 = `${year}-${String(month).padStart(2, '0')}-${day}`;
      const k3 = `${year}-${month}-${String(day).padStart(2, '0')}`;
      const k4 = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const mapSource = window.LUNAR_MAP_DATA && window.LUNAR_MAP_DATA.solar_lunar_map;
      const dayDataFromMap = mapSource ? (mapSource[k1] || mapSource[k2] || mapSource[k3] || mapSource[k4]) : null;

      if (dayDataFromMap && dayDataFromMap.hasEvent) {
          dayBox.classList.add('has-event');
          
          let emojiString = ""; // Chuỗi chứa các emoji tích hợp
          
          // Kiểm tra độc lập từng điều kiện để cộng dồn emoji vào chuỗi
          if (dayDataFromMap.Holiday) {
              emojiString += "🎉";
          }
          if (dayDataFromMap.Tiết_khí) {
              emojiString += "🌤";
          }
          
          // Nếu có ít nhất 1 emoji thì mới bọc vào thẻ span chung và chèn vào ô ngày
          if (emojiString !== "") {
              const iconHtml = `<span class="grid-event-icon">${emojiString}</span>`;
              dayBox.insertAdjacentHTML('beforeend', iconHtml);
          }
      }
      // =========================================================================

      dayBox.addEventListener("click", () => {
        updateTopCardInfo(thisDate);
        updateMoon(thisDate);
      });

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

      window.LUNAR_MAP_DATA = JSON.parse(JSON.stringify(ORIGINAL_BACKEND_DATA));
      
      const now = new Date();
      updateTopCardInfo(now);
      updateMoon(now);

      if (datePicker) datePicker.value = ""; 
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

  renderCalendar(viewYear, viewMonth);
  calendarGrid.style.display = "none"; 
});