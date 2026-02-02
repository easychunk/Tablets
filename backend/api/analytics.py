from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from db import get_db
from models import Checkin, Student
from schemas import CheckinAnalyticsOut, CheckinStudent
from security import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["analytics"])


@router.get("/checkins", response_model=list[CheckinAnalyticsOut])
def list_checkins(
    date: date | None = Query(None),
    class_id: int | None = Query(None),
    student_id: int | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    _: str = Depends(get_current_admin),
):
    query = db.query(Checkin).outerjoin(Student, Student.id == Checkin.student_id)

    if date:
        query = query.filter(func.date(Checkin.arrival_at) == date)
    if class_id:
        query = query.filter(Student.class_id == class_id)
    if student_id:
        query = query.filter(Checkin.student_id == student_id)
    if status:
        query = query.filter(Checkin.status == status)

    results = query.order_by(Checkin.arrival_at.desc()).all()
    response: list[CheckinAnalyticsOut] = []

    for item in results:
        student_out = None
        if item.student:
            student_out = CheckinStudent(
                id=item.student.id,
                full_name=item.student.full_name,
                class_id=item.student.class_id,
            )
        response.append(
            CheckinAnalyticsOut(
                id=item.id,
                arrival_at=item.arrival_at,
                status=item.status,
                late_by_minutes=item.late_by_minutes,
                nfc_uid=item.nfc_uid,
                student=student_out,
                device_id=item.device_id,
            )
        )

    return response
