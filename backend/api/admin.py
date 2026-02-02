from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db import get_db
from models import ClassGroup, Room, Student, Timetable
from schemas import (
    ClassCreate,
    ClassOut,
    ClassUpdate,
    RoomCreate,
    RoomOut,
    RoomUpdate,
    StudentCreate,
    StudentOut,
    StudentUpdate,
    TimetableOut,
    TimetableUpsert,
)
from security import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/rooms", response_model=list[RoomOut])
def list_rooms(db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return db.query(Room).order_by(Room.id.asc()).all()


@router.post("/rooms", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
def create_room(payload: RoomCreate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    room = Room(**payload.model_dump())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.put("/rooms/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    payload: RoomUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    room = db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(room, key, value)
    db.commit()
    db.refresh(room)
    return room


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(room_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    room = db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room)
    db.commit()


@router.get("/classes", response_model=list[ClassOut])
def list_classes(db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return db.query(ClassGroup).order_by(ClassGroup.id.asc()).all()


@router.post("/classes", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
def create_class(payload: ClassCreate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    class_group = ClassGroup(**payload.model_dump())
    db.add(class_group)
    db.commit()
    db.refresh(class_group)
    return class_group


@router.put("/classes/{class_id}", response_model=ClassOut)
def update_class(
    class_id: int,
    payload: ClassUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    class_group = db.get(ClassGroup, class_id)
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(class_group, key, value)
    db.commit()
    db.refresh(class_group)
    return class_group


@router.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    class_group = db.get(ClassGroup, class_id)
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
    db.delete(class_group)
    db.commit()


@router.get("/students", response_model=list[StudentOut])
def list_students(db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return db.query(Student).order_by(Student.id.asc()).all()


@router.post("/students", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    class_group = db.get(ClassGroup, payload.class_id)
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
    student = Student(**payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.put("/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    data = payload.model_dump(exclude_unset=True)
    if "class_id" in data:
        class_group = db.get(ClassGroup, data["class_id"])
        if not class_group:
            raise HTTPException(status_code=404, detail="Class not found")
    for key, value in data.items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    student = db.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()


@router.put("/timetable", response_model=TimetableOut)
def upsert_timetable(
    payload: TimetableUpsert,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    class_group = db.get(ClassGroup, payload.class_id)
    if not class_group:
        raise HTTPException(status_code=404, detail="Class not found")
    room = db.get(Room, payload.room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    entry = (
        db.query(Timetable)
        .filter(
            Timetable.weekday == payload.weekday,
            Timetable.class_id == payload.class_id,
            Timetable.lesson_number == payload.lesson_number,
        )
        .first()
    )
    if entry:
        entry.room_id = payload.room_id
        entry.title = payload.title
    else:
        entry = Timetable(**payload.model_dump())
        db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/timetable/{timetable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timetable(
    timetable_id: int,
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    entry = db.get(Timetable, timetable_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    db.delete(entry)
    db.commit()
