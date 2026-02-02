from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import (
    admin_router,
    analytics_router,
    auth_router,
    checkins_router,
    media_router,
    public_router,
)
from config import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_router)
app.include_router(checkins_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(media_router)
app.include_router(analytics_router)

os.makedirs(settings.media_dir, exist_ok=True)
app.mount(settings.media_url_prefix, StaticFiles(directory=settings.media_dir), name="media")


@app.get("/health")
async def health():
    return {"ok": True}
