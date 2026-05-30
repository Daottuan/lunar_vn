
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from pathlib import Path

from data.lunar_data import get_lunar_data

# =========================
# PATH PROJECT
# =========================

BASE_DIR = Path("/home/pi5/lunar-vn")

JSON_FILE = BASE_DIR / "sensor.json"

# =========================
# LẤY DỮ LIỆU
# =========================

data = get_lunar_data()

# =========================
# GHI FILE JSON
# =========================

with open(JSON_FILE, "w", encoding="utf-8") as f:

    json.dump(
        data,
        f,
        ensure_ascii=False,
        indent=2
    )

print("sensor.json updated")

