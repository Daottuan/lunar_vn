
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from lunardate import LunarDate

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

LUNAR_HOLIDAYS = {    ## lich am
    '1-1': 'Tết Nguyên Đán',
    '1-15': 'Tết Nguyên Tiêu',
    '3-3': 'Tết Hàn Thực',
    '3-10': 'Giỗ Tổ Hùng Vương',
    '4-15': 'Lễ Phật Đản',
    '5-5': 'Tết Đoan Ngọ',
    '7-15': 'Lễ Vu Lan',
    '8-15': 'Tết Trung Thu',
    '12-23': 'Ông Táo Chầu Trời',
    '2-19': 'Giỗ Bố',
    '6-5': 'Giỗ Cụ',
    '6-7': 'Giỗ Bà',
    '6-25': 'Giỗ Cụ Ty',
    '7-14': 'Giỗ Ông Nội',
    '12-12': 'Giỗ Ông Ngoại',
    '12-19': 'Giỗ Cụ Râu Dài',
    '4-14': ['Test lunar holiday', 'Ngày test'],
}

SOLAR_TERMS = {    ## Tiet khi lich duong
    '01-05': 'Tiểu Hàn',
    '01-20': 'Đại Hàn',
    '02-04': 'Lập Xuân',
    '02-19': 'Vũ Thủy',
    '03-05': 'Kinh Trập',
    '03-20': 'Xuân Phân',
    '04-04': 'Thanh Minh',
    '04-20': 'Cốc Vũ',
    '05-05': 'Lập Hạ',
    '05-21': 'Tiểu Mãn',
    '06-05': 'Mang Chủng',
    '06-21': 'Hạ Chí',
    '05-30': 'Test Tiet Khi'
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
    "OngTaoChautroi": "2312AL",
    "GioBo": "1902AL",
    "GioCu": "0506AL",
    "GioBaNoi": "0706AL",
    "GioCuTy": "2506AL",
    "GioOngNoi": "1407AL",
    "GioOngNgoai": "1212AL",
    "GioCuBinh": "1912AL",
    "Test AL": "1404AL",
    

    # ===== DƯƠNG LỊCH =====
    "TetDuongLich": "0101DL",
    "HocSinhSinhVien": "0901DL",
    "ThanhLapDang": "0302DL",
    "ThayThuocVN": "2702DL",
    "QuocTePhuNu": "0803DL",
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
    "CachMangThang8": "1908DL",
    "QuocKhanh": "0209DL",
    "DoanhNhanVN": "1310DL",
    "PhuNuVN": "2010DL",
    "GiangSinh":"2512DL",
    "SinhNhatMinhAn": "2309DL",
    "SinhNhatHaVy": "2401DL",
    "SinhNhatTueNhi": "3011DL",
    "SinhNhatVo": "0711DL",
    "SinhNhatTui": "0208DL",
    "Test DL": "3105DL"
    
}

def can_chi_year(y):

    return f'{CAN[(y + 6) % 10]} {CHI[(y + 8) % 12]}'


def can_chi_day(d, m, y):

    jd = (
        367 * y
        - int((7 * (y + int((m + 9) / 12))) / 4)
        - int((3 * (int((y + (m - 9) / 7) / 100) + 1)) / 4)
        + int((275 * m) / 9)
        + d
        + 1721029
    )

    can = CAN[(jd + 9) % 10]
    chi = CHI[(jd + 1) % 12]

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

        lunar = LunarDate.fromSolarDate(
            solar.year, solar.month, solar.day
        )

        leap = (
            getattr(lunar, "isLeapMonth", False)
            or getattr(lunar, "leap", False)
        )

        if lunar.day == day and lunar.month == month and leap == is_leap:
            return offset

    return None

    
def build_lunar_map(base_date=None):
    if base_date is None:
        base_date = datetime.now(TZ).date()

    lunar_map = {}

    for offset in range(366):
        solar = base_date + timedelta(days=offset)

        lunar = LunarDate.fromSolarDate(
            solar.year,
            solar.month,
            solar.day
        )

        is_leap = (
            getattr(lunar, "isLeapMonth", False)
            or getattr(lunar, "leap", False)
        )

        # 👉 phân biệt tháng nhuận
        suffix = "NAL" if is_leap else "AL"
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

    # nếu hôm nay đã tính rồi → dùng lại
    if COUNTDOWN_CACHE_DATE == today:
        return COUNTDOWN_CACHE

    # nếu qua ngày → build lại
    lunar_map = build_lunar_map(base_date=today)

    COUNTDOWN_CACHE = lunar_map
    COUNTDOWN_CACHE_DATE = today

    return lunar_map  
# =========================
# MAIN
# =========================
def get_lunar_data():

    now = datetime.now(TZ)

    today = now.date()
    tomorrow = today + timedelta(days=1)
    solar_day = today.day
    solar_month = today.month
    solar_year = today.year
    lunar_tomorrow = LunarDate.fromSolarDate(
        tomorrow.year,
        tomorrow.month,
        tomorrow.day
    )
    
    lt_d = lunar_tomorrow.day
    

    lunar = LunarDate.fromSolarDate(
        solar_year,
        solar_month,
        solar_day
    )

    d = lunar.day
    m = lunar.month
    y = lunar.year
    
    ram_offset = None
    for i in range(0, 366):
        solar = today + timedelta(days=i)
        lunar_i = LunarDate.fromSolarDate(solar.year, solar.month, solar.day)
        if lunar_i.day == 15:
           ram_offset = i
           break
       
    # tìm mùng 1 âm lịch gần nhất từ hôm nay
    mung1_offset = None
    for i in range(0, 366):
        solar = today + timedelta(days=i)
        lunar_i = LunarDate.fromSolarDate(solar.year, solar.month, solar.day)
        if lunar_i.day == 1:
           mung1_offset = i
           break
       
    is_mung1  = (d == 1)
    is_ram = (d == 15)
    special_day = ''
    if d == 1:
        special_day = 'Mùng 1'
    elif d == 15:
        special_day = 'Ngày Rằm'

    # TIẾT KHÍ (SOLAR TERM)
    # =====================
    key = f"{today.month:02d}-{today.day:02d}"
    solar_term = SOLAR_TERMS.get(key, '')
   
    key = f"{m}-{d}"
    holiday = LUNAR_HOLIDAYS.get(key, '')
    if isinstance(holiday, list):
       holiday = ', '.join(holiday)
   
    lunar_full_map = get_lunar_map_cached()
    
    # =========================
    # COUNTDOWN SỰ KIỆN
    # =========================
    special_countdowns = {}

    for name, key in SPECIAL_COUNTDOWNS.items():
        
        if name in ["NgayRam", "MungMot"]:
           continue
       
        if key.endswith(("AL", "NAL")):
    
            day = int(key[:2])
            month = int(key[2:4])
    
            base_key = f"{day:02d}{month:02d}"
    
            # 🔥 ƯU TIÊN AL → nếu không có thì NAL
            offset_al = lunar_full_map.get(base_key + "AL")
            offset_nal = lunar_full_map.get(base_key + "NAL")
            
            candidates = [
                x for x in [offset_al, offset_nal]
                if x is not None
            ]
            
            offset = min(candidates) if candidates else 365
    
            special_countdowns[name] = offset
            #special_countdowns[key] = offset
    
    
        elif key.endswith("DL"):
    
            day = int(key[:2])
            month = int(key[2:4])
    
            target = date(today.year, month, day)
            if target < today:
                target = date(today.year + 1, month, day)
    
            remaining = (target - today).days
    
            special_countdowns[name] = remaining
        
            
    result = {

        # =====================
        # HIỂN THỊ
        # =====================
        "daottuan":"thanhtuan3032000@gmail.com",
            
        "lichAm":   
            f'{d:02d}/{m:02d} ÂL '
            f'({can_chi_year(y)})',


        'tts': (
            f'Hôm nay là {WEEKDAYS[today.weekday()]}, '
            f'ngày {today.strftime("%d/%m/%Y")}. '
            f'Âm lịch là '
            f'{"mùng" if d < 10 else "ngày"} {d} '
            f'tháng {m}, '
            f'năm {can_chi_year(y)}'
            + (
                f'. Hôm nay là {holiday}'
                if holiday else ''
              )
        ),

        # =====================
        # DƯƠNG LỊCH
        # =====================
        "Dương_lịch":
            #now.strftime('%d/%m/%Y %H:%M:%S'),
            today.strftime('%d/%m/%Y'),

        "Thứ":
            WEEKDAYS[today.weekday()],

        # =====================
        # ÂM LỊCH
        # =====================
        "day": d,
        "month": m,
        "year": y,

        # =====================
        # ĐẶC BIỆT
        # =====================
        "Tháng_nhuận":
        (
            getattr(lunar, "isLeapMonth", False)
            or getattr(lunar, "leap", False)
        ),
        "Mùng_một": is_mung1,
        "Ngày_rằm": is_ram,
        'Mai_là_mùng_1': lt_d == 1,
        'Mai_là_ngày_rằm': lt_d == 15, 
        "Special_day": special_day,
        "Holiday": holiday,

        # =====================
        # CAN CHI
        # =====================
        "Can_chi_year":
            can_chi_year(y),

        "Can_chi_month":
            can_chi_month(m, y),

        "Can_chi_day":
            can_chi_day(
                solar_day,
                solar_month,
                solar_year
            ),

        # =====================
        # TIẾT KHÍ
        # =====================
        "Tiết_khí": #solar_term,
             SOLAR_TERMS.get(
                today.strftime('%m-%d'),
                ''
            ),
        # =====================
        # TIME
        # =====================
        #"timestamp":
        #    int(now.timestamp()),

        #"iso":
        #    now.isoformat(),

        # =====================
        # COUNTDOWN
        # =====================
        "NgayRam": ram_offset if ram_offset is not None else 365,
        "MungMot": mung1_offset if mung1_offset is not None else 365,
        #"countdown": {
        "events": special_countdowns,
        "lunar": lunar_full_map
        #}
    }
    result.update(result.pop("events", {}))
    result.update(result.pop("lunar", {}))
    
    return result

