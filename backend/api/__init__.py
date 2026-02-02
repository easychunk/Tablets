from .admin import router as admin_router
from .analytics import router as analytics_router
from .auth import router as auth_router
from .checkins import router as checkins_router
from .media import router as media_router
from .public import router as public_router

__all__ = [
    "admin_router",
    "analytics_router",
    "auth_router",
    "checkins_router",
    "media_router",
    "public_router",
]
