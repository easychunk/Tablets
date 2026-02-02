from datetime import datetime
from zoneinfo import ZoneInfo

from config import settings


def now_vienna() -> datetime:
    return datetime.now(ZoneInfo(settings.timezone))
