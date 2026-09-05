from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from lunardate import LunarDate
import json
import os

# =========================
# COUNTDOWN NGÀY ÂM
# =========================

TZ = ZoneInfo("Asia/Ho_Chi_Minh")
COUNTDOWN_CACHE = {}
COUNTDOWN_CACHE_DATE = None

CAN = [
    'Giáp','Ất','Bính','Đinh','Mậu',
    'Kỷ','Canh','Tân','Nhâm','Quý'
]

CHI = [
    'Tý','Sửu','Dần','Mão','Thìn','Tỵ',
    'Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'
]

WEEKDAYS = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ Nhật'
]

LUNAR_HOLIDAYS = {    ## lich am, hien thi ##
    '1-1': 'Tết Nguyên Đán',
    '1-15': 'Tết Nguyên Tiêu',
    '3-3': 'Tết Hàn Thực',
    '3-10': 'Giỗ Tổ Hùng Vương',
    '4-15': 'Lễ Phật Đản',
    '5-5': 'Tết Đoan Ngọ',
    '7-15': 'Lễ Vu Lan',
    '8-15': 'Tết Trung Thu',
    '8-2': 'Sinh Nhật Ngày Âm',
    '12-23': 'Ông Táo Chầu Trời',
    '2-19': 'Giỗ Bố',
    '6-5': 'Giỗ Cụ',
    '6-7': 'Giỗ Bà Nội',
    '6-25': 'Giỗ Cụ Ty',
    '7-14': 'Giỗ Ông Nội',
    '12-12': 'Giỗ Ông Ngoại',
    '12-19': 'Giỗ Cụ Râu Dài',
    '4-14': ['Test Hiển Thị Ngày Âm', 'Ngày Test'],
}

SOLAR_TERMS = {    ## Tiet khi lich duong, hien thi ##
    '01-01': 'Tết Dương Lịch',
    '01-05': 'Tiểu Hàn',
    '01-09': 'Học Sinh Sinh Viên',
    '01-20': 'Đại Hàn',
    '01-24': 'Sinh Nhật Hà Vy',
    
    '02-04': 'Lập Xuân',
    '02-03': 'Thành Lập Đảng CS Việt Nam',
    '02-19': 'Vũ Thủy',
    '02-27': 'Thày Thuốc Việt Nam',
    
    '03-05': 'Kinh Trập',
    '03-08': 'Quốc Tế Phụ Nữ',
    '03-11': 'Thành Lập Công Ty Anh Nhi',
    '03-20': ['Xuân Phân', 'Quốc Tế Hạnh Phúc'],
    '03-26': 'Thành Lập Đoàn',
    
    '04-04': 'Thanh Minh',
    '04-20': 'Cốc Vũ',
    '04-20': 'Sách Việt Nam',
    '04-30': 'Giải Phóng Miền Nam',
    
    '05-01': 'Quốc Tế Lao Động',
    '05-05': 'Lập Hạ',
    '05-15': 'Thành Lập Đội',
    '05-21': 'Tiểu Mãn',
    
    '06-01': 'Quốc Tế Thiếu Nhi',
    '06-05': 'Mang Chủng',
    '06-21': 'Hạ Chí',
    '06-28': 'Gia Đình Việt Nam',
    
    '07-27': 'Thương Binh Liệt Sỹ',
    '07-29': 'My Wedding',
    
  
    '08-19': 'Cách Mạng Tháng 8',
    
    '09-02': 'Quốc Khánh Việt Nam',
    '09-05': 'Khai Giảng Năm Học Mới',
    '09-08': 'Sinh Nhật Tôi',
    '09-23': 'Sinh Nhật Minh An',
    
    '10-13': 'Doanh Nhân Việt Nam',
    '10-20': 'Phụ Nữ Việt Nam',
    
    '11-07': 'Sinh Nhật Vợ',
    '11-20': 'Ngày Nhà giáo Việt Nam',
    '11-30': 'Sinh Nhật Tuệ Nhi',
    
    '12-25': 'Giáng Sinh',
    
    '07-18': 'Test Hiển Thị Ngày Dương'
}
SPECIAL_COUNTDOWNS = {
    # ===== ÂM LỊCH =====
    "TetNguyenDan": "0101AL",
    "TetNguyenTieu": "1501AL",
    "TetHanThuc": "0303AL",
    "GioToHungVuong": "1003AL",
    "LePhatDan": "1504AL",
    "TetDoanNgo": "0505AL",
    "LeVuLan": "1507AL",
    "TetTrungThu": "1508AL",
    "SinhNhatNgayAm": "0208AL",
    "OngTaoChautroi": "2312AL",
    "GioBo": "1902AL",
    "GioCu": "0506AL",
    "GioBaNoi": "0706AL",
    "GioCuTy": "2506AL",
    "GioÔngNoi": "1407AL",
    "GioÔngNgoai": "1212AL",
    "GioCuBinh": "1912AL",
    

    # ===== DƯƠNG LỊCH =====
    "TetDuongLich": "0101DL",
    "HocSinhSinhVien": "0901DL",
    "SinhNhatHaVy": "2401DL",
    
    "ThanhLapDang": "0302DL",
    "ThayThuocVN": "2702DL",
    
    "QuocTePhuNu": "0803DL",
    "ThanhLapCongTyAnhNhi": "1103DL",
    "QuocTeHanhPhuc": "2003DL",
    "ThanhLapDoan": "2603DL",
    
    "SachVN": "2104DL",
    "GiaiPhong": "3004DL",
    
    "QuocTeLaoDong": "0105DL",
    "ThanhLapDoi": "1505DL",
    "NgaySinhBacHo": "1905DL",
    
    "QuocteThieuNhi": "0106DL",
    "GiaDinhVN": "2806DL",
    
    "ThuongBinhLietSi": "2707DL",
    "MyWedding": "2907DL",
    
    
    "CachMangThang8": "1908DL",

    
    "QuocKhanh": "0209DL",
    "KhaiGiangNamHocMoi": "0509DL",
    "SinhNhatTui": "0809DL",
    "SinhNhatMinhAn": "2309DL",
    
    "DoanhNhanVN": "1310DL",
    "PhuNuVN": "2010DL",
    
    "SinhNhatVo": "0711DL",
    "NhaGiaoVietNam": "2011DL",
    "SinhNhatTueNhi": "3011DL",
    
    "GiangSinh":"2512DL",
    
    
    "TestDemNguoc AL": "1404AL",
    "TestDemNguoc DL": "0307DL"
}

def can_chi_year(y):
    return f'{CAN[(y + 6) % 10]} {CHI[(y + 8) % 12]}'

def can_chi_day(d, m, y):
    # Lấy số thứ tự ngày tuyệt đối trong Python
    day_ordinal = date(y, m, d).toordinal()
    # Ánh xạ chuẩn theo hệ Can Chi Việt Nam
    can = CAN[(day_ordinal + 2) % 10]
    chi = CHI[(day_ordinal + 4) % 12]
    return f'{can} {chi}'
    
def can_chi_month(lunar_month, lunar_year):
    can = CAN[
        (lunar_year * 12 + lunar_month + 3) % 10
    ]
    chi = CHI[(lunar_month + 1) % 12]
    return f'{can} {chi}'

def lunar_to_solar(year, month, day, is_leap=False):
    today = datetime.now(TZ).date()
    for offset in range(0, 366):
        solar = today + timedelta(days=offset)
        lunar = LunarDate.fromSolarDate(solar.year, solar.month, solar.day)
        leap = getattr(lunar, "isLeapMonth", False) or getattr(lunar, "leap", False)
        if lunar.day == day and lunar.month == month and leap == is_leap:
            return offset
    return None

def build_lunar_map(base_date=None):
    if base_date is None:
        base_date = datetime.now(TZ).date()
    lunar_map = {}
    for offset in range(366):
        solar = base_date + timedelta(days=offset)
        lunar = LunarDate.fromSolarDate(solar.year, solar.month, solar.day)
        is_leap = getattr(lunar, "isLeapMonth", False) or getattr(lunar, "leap", False)
        suffix = "NAL" if is_leap else "AL"
        # Sửa lại định dạng Key map phẳng theo đúng mẫu của bạn (Ví dụ: "2005AL")
        key = f"{lunar.day:02d}{lunar.month:02d}{suffix}"
        if key not in lunar_map:
            lunar_map[key] = offset
    return lunar_map

def parse_key(key):
    if key.endswith("NAL"):
        return key[:2], key[2:4], True
    elif key.endswith("AL"):
        return key[:2], key[2:4], False
    return None, None, False    

def get_lunar_map_cached():
    global COUNTDOWN_CACHE, COUNTDOWN_CACHE_DATE
    today = datetime.now(TZ).date()
    if COUNTDOWN_CACHE_DATE == today:
        return COUNTDOWN_CACHE
    lunar_map = build_lunar_map(base_date=today)
    COUNTDOWN_CACHE = lunar_map
    COUNTDOWN_CACHE_DATE = today
    return lunar_map  

def export_lunar_json_for_ha(today, special_countdowns):
    solar_day = today.day
    solar_month = today.month
    solar_year = today.year
    
    lunar = LunarDate.fromSolarDate(solar_year, solar_month, solar_day)
    d = lunar.day
    m = lunar.month
    y = lunar.year
    
    tomorrow = today + timedelta(days=1)
    lunar_tomorrow = LunarDate.fromSolarDate(tomorrow.year, tomorrow.month, tomorrow.day)
    lt_d = lunar_tomorrow.day
    
    is_mung1 = (d == 1)
    is_ram = (d == 15)
    special_day = 'Mùng 1' if d == 1 else ('Ngày Rằm' if d == 15 else '')
    
    key_term = f"{solar_month:02d}-{solar_day:02d}"
    solar_term = SOLAR_TERMS.get(key_term, '')
    if isinstance(solar_term, list):
        solar_term = ', '.join(solar_term)
    
    key_holiday = f"{m}-{d}"
    holiday = LUNAR_HOLIDAYS.get(key_holiday, '')
    if isinstance(holiday, list):
        holiday = ', '.join(holiday)
        
    lunar_full_map = get_lunar_map_cached()
    
    # Tạo cấu trúc phẳng chính xác tuyệt đối theo mẫu của bạn
    ha_flat_data = {
        "daottuan": "thanhtuan3032000@gmail.com",
        "lichAm": f'{d:02d}/{m:02d} ÂL ({can_chi_year(y)})',
        'tts': (
            f'Hôm nay là {WEEKDAYS[today.weekday()]}, '
            f'ngày {today.strftime("%d/%m/%Y")}. '
            f'Âm lịch là '
            f'{"mùng" if d < 10 else "ngày"} {d} '
            f'tháng {m}, '
            f'năm {can_chi_year(y)}'
            + (f'. Hôm nay là {holiday}' if holiday else '')
        ),
        "Dương_lịch": today.strftime('%d/%m/%Y'),
        "Thứ": WEEKDAYS[today.weekday()],
        "day": d,
        "month": m,
        "year": today.year,  # lấy năm dương lịch theo mẫu yêu cầu
        "Tháng_nhuận": getattr(lunar, "isLeapMonth", False) or getattr(lunar, "leap", False),
        "Mùng_một": is_mung1,
        "Ngày_rằm": is_ram,
        'Mai_là_mùng_1': lt_d == 1,
        'Mai_là_ngày_rằm': lt_d == 15, 
        "Special_day": special_day,
        "Holiday": holiday,
        "Tiết_khí": solar_term,
        "Can_chi_year": can_chi_year(y),
        "Can_chi_month": can_chi_month(m, y),
        "Can_chi_day": can_chi_day(solar_day, solar_month, solar_year),
    }
    
    # Đẩy toàn bộ các giá trị đếm ngược ngày lễ vào
    ha_flat_data.update(special_countdowns)
    
    # Đẩy danh sách map 366 ngày âm lịch kế tiếp vào
    ha_flat_data.update(lunar_full_map)
    
    # Thực hiện GHI ĐÈ dữ liệu phẳng tinh gọn này vào file vật lý sensor.json
    with open("sensor.json", "w", encoding="utf-8") as f:
        json.dump(ha_flat_data, f, ensure_ascii=False, indent=2)
        
    return ha_flat_data

def get_lunar_data(target_date_str=None):
    """
    Hàm lấy dữ liệu âm dương lịch nâng cấp.
    :param target_date_str: Chuỗi ngày định dạng "YYYY-MM-DD" do Frontend gửi lên (nếu có).
                            Nếu là None, hệ thống tự động lấy ngày hôm nay.
    """
    now = datetime.now(TZ)
    today = now.date() # Luôn giữ mốc ngày hôm nay thực tế
    
    # 1. XỬ LÝ TÍNH NĂNG "ĐI ĐẾN MỘT NGÀY CỤ THỂ"
    if target_date_str:
        try:
            # Chuyển đổi chuỗi "YYYY-MM-DD" từ giao diện gửi về thành đối tượng date
            current_focus_date = datetime.strptime(target_date_str, "%Y-%m-%d").date()
        except ValueError:
            # Nếu định dạng chuỗi truyền lên bị lỗi, tự động quay về ngày hôm nay
            current_focus_date = today
    else:
        # Nếu không truyền gì (hoặc bấm Quay lại ngày hôm nay), mặc định lấy ngày hôm nay
        current_focus_date = today

    tomorrow = current_focus_date + timedelta(days=1)
    solar_day = current_focus_date.day
    solar_month = current_focus_date.month
    solar_year = current_focus_date.year
    
    lunar_tomorrow = LunarDate.fromSolarDate(tomorrow.year, tomorrow.month, tomorrow.day)
    lt_d = lunar_tomorrow.day
    lunar = LunarDate.fromSolarDate(solar_year, solar_month, solar_day)

    d = lunar.day
    m = lunar.month
    y = lunar.year
    
    # Tính toán các khoảng cách mùng 1, ngày rằm dựa trên ngày đang được chọn
    ram_offset = None
    for i in range(0, 366):
        solar = current_focus_date + timedelta(days=i)
        lunar_i = LunarDate.fromSolarDate(solar.year, solar.month, solar.day)
        if lunar_i.day == 15:
           ram_offset = i
           break
       
    mung1_offset = None
    for i in range(0, 366):
        solar = current_focus_date + timedelta(days=i)
        lunar_i = LunarDate.fromSolarDate(solar.year, solar.month, solar.day)
        if lunar_i.day == 1:
           mung1_offset = i
           break
       
    is_mung1 = (d == 1)
    is_ram = (d == 15)
    special_day = 'Mùng 1' if d == 1 else ('Ngày Rằm' if d == 15 else '')

    key = f"{current_focus_date.month:02d}-{current_focus_date.day:02d}"
    solar_term = SOLAR_TERMS.get(key, '')
   
    key = f"{m}-{d}"
    holiday = LUNAR_HOLIDAYS.get(key, '')
    if isinstance(holiday, list):
       holiday = ', '.join(holiday)
   
    lunar_full_map = get_lunar_map_cached()
    
    special_countdowns = {}
    for name, k in SPECIAL_COUNTDOWNS.items():
        if name in ["NgayRam", "MungMot"]:
           continue
       
        if k.endswith(("AL", "NAL")):
            day_val = int(k[:2])
            month_val = int(k[2:4])
            base_key = f"{day_val:02d}{month_val:02d}"
            offset_al = lunar_full_map.get(base_key + "AL")
            offset_nal = lunar_full_map.get(base_key + "NAL")
            
            candidates = [x for x in [offset_al, offset_nal] if x is not None]
            offset = min(candidates) if candidates else 365
            special_countdowns[name] = offset
    
        elif k.endswith("DL"):
            day_val = int(k[:2])
            month_val = int(k[2:4])
            target = date(current_focus_date.year, month_val, day_val)
            if target < current_focus_date:
                target = date(current_focus_date.year + 1, month_val, day_val)
            remaining = (target - current_focus_date).days
            special_countdowns[name] = remaining

    special_countdowns["NgayRam"] = ram_offset if ram_offset is not None else 365
    special_countdowns["MungMot"] = mung1_offset if mung1_offset is not None else 365

    # === TẠO BẢN ĐỒ ÁNH XẠ DƯƠNG - ÂM CHUẨN XÁC ĐỂ GRID LỊCH ĐỒNG BỘ ===
    solar_lunar_map = {}
    start_map_date = today - timedelta(days=365 * 5)
    for i in range(365 * 20 + 5):
        sd = start_map_date + timedelta(days=i)
        ld = LunarDate.fromSolarDate(sd.year, sd.month, sd.day)
        is_l = getattr(ld, "isLeapMonth", False) or getattr(ld, "leap", False)
        
        # 1. Lấy ngày lễ Dương lịch (Từ cấu hình SOLAR_TERMS của bạn)
        s_key = f"{sd.month:02d}-{sd.day:02d}"
        s_holiday = SOLAR_TERMS.get(s_key, '')
        if isinstance(s_holiday, list):
            s_holiday = ', '.join(s_holiday)
            
        # 2. Lấy ngày lễ Âm lịch (Từ cấu hình LUNAR_HOLIDAYS của bạn)
        l_key = f"{ld.month}-{ld.day}"
        l_holiday = LUNAR_HOLIDAYS.get(l_key, '')
        if isinstance(l_holiday, list):
            l_holiday = ', '.join(l_holiday)
            
        # Khởi tạo cờ đánh dấu ngày có sự kiện
        has_event = bool(s_holiday or l_holiday)

        solar_lunar_map[f"{sd.year}-{sd.month}-{sd.day}"] = {
            "day": ld.day,
            "month": ld.month,
            "isLeap": is_l,
            "Holiday": l_holiday,       # Lễ âm lịch (ví dụ: Tết Trung Thu)
            "Tiết_khí": s_holiday,      # Lễ dương lịch/Tiết khí (ví dụ: Cách Mạng Tháng 8)
            "hasEvent": has_event       # Cờ đánh dấu để JS nhận diện nhanh trên lưới lịch
        }

    # Xuất file sensor.json cho Home Assistant dựa trên ngày đang chọn
    export_lunar_json_for_ha(current_focus_date, special_countdowns)
        
    base_data_info = {
        "daottuan": "thanhtuan3032000@gmail.com",
        "lichAm": f'{d:02d}/{m:02d} ÂL ({can_chi_year(y)})',
        'tts': (
            f'Hôm nay là {WEEKDAYS[current_focus_date.weekday()]}, '
            f'ngày {current_focus_date.strftime("%d/%m/%Y")}. '
            f'Âm lịch là '
            f'{"mùng" if d < 10 else "ngày"} {d} '
            f'tháng {m}, '
            f'năm {can_chi_year(y)}'
            + (f'. Hôm nay là {holiday}' if holiday else '')
        ),
        "Dương_lịch": current_focus_date.strftime('%d/%m/%Y'),
        "Thứ": WEEKDAYS[current_focus_date.weekday()],
        "day": d,
        "month": m,
        "year": today.year, # Giữ nguyên năm Dương lịch thực tế để đồng bộ lưới
        "Tháng_nhuận": getattr(lunar, "isLeapMonth", False) or getattr(lunar, "leap", False),
        "Mùng_một": is_mung1,
        "Ngày_rằm": is_ram,
        'Mai_là_mùng_1': lt_d == 1,
        'Mai_là_ngày_rằm': lt_d == 15, 
        "Special_day": special_day,
        "Holiday": holiday,
        "Tiết_khí": SOLAR_TERMS.get(current_focus_date.strftime('%m-%d'), ''),
        "Can_chi_year": can_chi_year(y),
        "Can_chi_month": can_chi_month(m, y),
        "Can_chi_day": can_chi_day(solar_day, solar_month, solar_year),
        "NgayRam": special_countdowns["NgayRam"],
        "MungMot": special_countdowns["MungMot"],
        "Is_Today": current_focus_date == today # Trả thêm cờ kiểm tra xem có phải ngày hôm nay thực tế không
    }
            
    result = dict(base_data_info)
    result.update({
        "events": special_countdowns,
        "lunar": lunar_full_map,
        "solar_lunar_map": solar_lunar_map
    })
    
    return result