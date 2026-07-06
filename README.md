## LUNAR-VN - HƯỚNG DẪN CẤU HÌNH

## 1. Giới thiệu
Dự án `lunar-vn` cung cấp API hiển thị lịch âm, ngày rằm, lễ Tết và countdown âm lịch.

## 2. Cài đặt

## Clone dự án
```bash
git clone https://github.com/Daottuan/lunar_vn.git
cd lunar-vn

## Cấu hình cho Homeassistant
- platform: rest
    name: "Lunar daottuan"
    unique_id: lunar_daottuan
    icon: mdi:calendar-star
    resource: https://raw.githubusercontent.com/Daottuan/lunar_vn/refs/heads/main/sensor.json
    value_template: "{{ value_json.lichAm }}"
    scan_interval: 3600
    json_attributes:
      - tts
      - Dương_lịch
      - day
      - month
      - year
      - Can_chi_year
      - Can_chi_month
      - Can_chi_day
      - Mùng_một
      - Ngày_rằm
      .....
## Dùng MQTT 
    payload=$(cat /home/pi5/lunar-vn/sensor.json)
    mosquitto_pub \
      -h ip mqtt \
      -u tendangnhapmqtt \
      -P passmqtt \
      -t home/lunar/vn \
      -r \
      -m "$payload"
    echo "$(date) - MQTT pushed"
