from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from db import get_db
from models import BellTime, Room, Timetable, ClassGroup
from schemas import ClassScheduleLesson, ClassScheduleOut, RoomNowOut, DoorLesson
from time_utils import now_vienna

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/rooms/{room_id}/now", response_model=RoomNowOut)
def room_now(room_id: int, db: Session = Depends(get_db)):
    room = db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    now = now_vienna()
    weekday = now.isoweekday()
    now_time = now.time()

    bell = (
        db.query(BellTime)
        .filter(
            and_(
                BellTime.weekday == weekday,
                BellTime.start_time <= now_time,
                BellTime.end_time > now_time,
            )
        )
        .first()
    )

    lesson = None
    if bell:
        tt = (
            db.query(Timetable)
            .filter(
                Timetable.weekday == weekday,
                Timetable.room_id == room_id,
                Timetable.lesson_number == bell.lesson_number,
            )
            .first()
        )
        if tt:
            lesson = DoorLesson(title=tt.title, start_time=bell.start_time, end_time=bell.end_time)

    return RoomNowOut(
        room_id=room.id,
        room_name=room.name,
        current_time=now,
        lesson=lesson,
    )


@router.get("/classes/{class_id}/schedule", response_model=ClassScheduleOut)
def class_schedule(
    class_id: int,
    date: date = Query(...),
    db: Session = Depends(get_db),
):
    class_group = db.get(ClassGroup, class_id)
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")

    weekday = date.isoweekday()
    rows = (
        db.query(Timetable, BellTime, Room)
        .join(
            BellTime,
            and_(
                BellTime.weekday == Timetable.weekday,
                BellTime.lesson_number == Timetable.lesson_number,
            ),
        )
        .join(Room, Room.id == Timetable.room_id)
        .filter(Timetable.weekday == weekday, Timetable.class_id == class_id)
        .order_by(Timetable.lesson_number.asc())
        .all()
    )

    lessons = [
        ClassScheduleLesson(
            lesson_number=tt.lesson_number,
            title=tt.title,
            start_time=bell.start_time,
            end_time=bell.end_time,
            room_id=room.id,
            room_name=room.name,
        )
        for tt, bell, room in rows
    ]

    return ClassScheduleOut(class_id=class_id, date=date, lessons=lessons)
