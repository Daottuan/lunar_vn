from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from lunardate import LunarDate

TZ = ZoneInfo("Asia/Ho_Chi_Minh")

CAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý']

CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi']

WEEKDAYS = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ Nhật'
]

LUNAR_HOLIDAYS = {
    '1-1': 'Tết Nguyên Đán',
    '1-15': 'Tết Nguyên Tiêu',
    '3-3': 'Tết Hàn Thực',
    '3-10': 'Giỗ Tổ Hùng Vương',
    '4-15': 'Lễ Phật Đản',
    '5-5': 'Tết Đoan Ngọ',
    '7-15': 'Lễ Vu Lan',
    '8-15': 'Tết Trung Thu',
    '12-23': 'Ông Táo Chầu Trời',
    '5-6': ['Ngày Test', 'Ngày Hội Non Sông'],
    '2-19': 'Giỗ Bố',
    '6-5': 'Giỗ Cụ',
    '6-7': 'Giỗ Bà',
    '6-25': 'Giỗ Cụ Ty',
    '7-14': 'Giỗ Ông Nội',
    '12-12': 'Giỗ Ông Ngoại',
    '12-19': 'Giỗ Cụ Râu Dài'
    
    
}

SOLAR_TERMS = {
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
    '06-21': 'Hạ Chí'
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
    mung_1 = (d == 1)
    ngay_ram = (d == 15)
    special_day = ''
    if d == 1:
        special_day = 'Mùng 1'
    elif d == 15:
        special_day = 'Ngày Rằm'

    return {
    
       
        

        'display': f'{d:02d}/{m:02d} ÂL ({can_chi_year(y)})' + (f' - {special_day}' if special_day else ''),
        
        'tts':
            f'Ngày {d} tháng {m}',

        'solar_date':
            today.strftime('%d/%m/%Y'),

        'weekday':
            WEEKDAYS[today.weekday()],

        'day': d,
        'month': m,
        'year': y,
        'tomorrow_is_mung1': lt_d == 1,
        'tomorrow_is_ram': lt_d == 15, 
        'mung_1': mung_1,
        'ngay_ram': ngay_ram,
        'special_day': special_day,

        'can_chi_year':
            can_chi_year(y),

        'can_chi_month':
            can_chi_month(m, y),

        'can_chi_day':
            can_chi_day(
                solar_day,
                solar_month,
                solar_year
            ),

        'holiday':
            LUNAR_HOLIDAYS.get(
                f'{m}-{d}',
                ''
            ),

        'solar_term':
            SOLAR_TERMS.get(
                today.strftime('%m-%d'),
                ''
            ),

        'leap_month':
            getattr(
                lunar,
                'isLeapMonth',
                False
            ),

        'timestamp':
            int(now.timestamp()),

        'iso':
            now.isoformat()
    }
