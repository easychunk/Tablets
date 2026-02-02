from datetime import datetime, timedelta, time as time_type
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc

from config import settings
from db import get_db
from models import BellTime, Checkin, Device, Student
from schemas import CheckinCreate, CheckinOut, CheckinStudent
from time_utils import now_vienna

router = APIRouter(prefix="/api", tags=["checkins"])


def _school_start_time(db: Session, weekday: int) -> time_type:
    if settings.school_start_time:
        return time_type.fromisoformat(settings.school_start_time)

    bell = (
        db.query(BellTime)
        .filter(BellTime.weekday == weekday, BellTime.lesson_number == 1)
        .first()
    )
    if bell:
        return bell.start_time

    bell = (
        db.query(BellTime)
        .filter(BellTime.weekday == weekday)
        .order_by(asc(BellTime.start_time))
        .first()
    )
    if bell:
        return bell.start_time

    raise HTTPException(status_code=500, detail="Bell times not configured")


@router.post("/checkins", response_model=CheckinOut)
def create_checkin(payload: CheckinCreate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.device_key == payload.device_key).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    if device.type != "entrance":
        raise HTTPException(status_code=400, detail="Device type not allowed")

    now = now_vienna()
    weekday = now.isoweekday()
    start_time = _school_start_time(db, weekday)

    tz = ZoneInfo(settings.timezone)
    threshold = datetime.combine(now.date(), start_time, tzinfo=tz) + timedelta(
        minutes=settings.grace_minutes
    )

    if now > threshold:
        status_value = "late"
        late_by = int((now - threshold).total_seconds() // 60)
    else:
        status_value = "on_time"
        late_by = 0

    student = db.query(Student).filter(Student.nfc_uid == payload.nfc_uid).first()
    checkin = Checkin(
        student_id=student.id if student else None,
        nfc_uid=payload.nfc_uid,
        device_id=device.id,
        arrival_at=now,
        status=status_value,
        late_by_minutes=late_by,
    )
    db.add(checkin)
    db.commit()

    student_out = None
    if student:
        student_out = CheckinStudent(
            id=student.id,
            full_name=student.full_name,
            class_id=student.class_id,
        )

    return CheckinOut(
        ok=True,
        student=student_out,
        status=status_value,
        arrival_time=now,
        late_by_minutes=late_by,
    )
