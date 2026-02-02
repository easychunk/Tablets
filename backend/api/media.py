import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from config import settings
from db import get_db
from models import Media
from schemas import MediaOut
from security import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["media"])


def _media_url(filename: str) -> str:
    base = settings.public_base_url.rstrip("/")
    prefix = settings.media_url_prefix
    if not prefix.startswith("/"):
        prefix = f"/{prefix}"
    return f"{base}{prefix}/{filename}"


@router.get("/media", response_model=list[MediaOut])
def list_media(db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    items = db.query(Media).order_by(Media.created_at.desc()).all()
    return [
        MediaOut(
            id=item.id,
            type=item.type,
            filename=item.filename,
            url=_media_url(item.path),
            is_active=item.is_active,
            created_at=item.created_at,
        )
        for item in items
    ]


@router.post("/media", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
def upload_media(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    os.makedirs(settings.media_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1].lower()
    safe_name = f"{uuid4().hex}{ext}"
    path = os.path.join(settings.media_dir, safe_name)

    with open(path, "wb") as handle:
        handle.write(file.file.read())

    item = Media(
        type="video",
        filename=file.filename,
        path=safe_name,
        duration_sec=None,
        is_active=True,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return MediaOut(
        id=item.id,
        type=item.type,
        filename=item.filename,
        url=_media_url(item.path),
        is_active=item.is_active,
        created_at=item.created_at,
    )


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    item = db.get(Media, media_id)
    if not item:
        raise HTTPException(status_code=404, detail="Media not found")

    file_path = os.path.join(settings.media_dir, item.path)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(item)
    db.commit()
