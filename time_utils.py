from datetime import datetime
from zoneinfo import ZoneInfo

INDIA_TIME_ZONE = ZoneInfo("Asia/Kolkata")


def today_in_india() -> str:
    return datetime.now(INDIA_TIME_ZONE).date().isoformat()


def is_today_in_india(date_value: str) -> bool:
    return date_value == today_in_india()
