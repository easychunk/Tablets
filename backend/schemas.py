from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict


class RoomBase(BaseModel):
    name: str
    location: Optional[str] = None
    is_active: bool = True


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class RoomOut(RoomBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ClassBase(BaseModel):
    name: str
    is_active: bool = True


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class ClassOut(ClassBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StudentBase(BaseModel):
    full_name: str
    class_id: int
    nfc_uid: str
    is_active: bool = True


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    class_id: Optional[int] = None
    nfc_uid: Optional[str] = None
    is_active: Optional[bool] = None


class StudentOut(StudentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TimetableUpsert(BaseModel):
    weekday: int
    class_id: int
    room_id: int
    lesson_number: int
    title: str


class TimetableOut(BaseModel):
    id: int
    weekday: int
    class_id: int
    room_id: int
    lesson_number: int
    title: str

    model_config = ConfigDict(from_attributes=True)


class DoorLesson(BaseModel):
    title: str
    start_time: time
    end_time: time


class RoomNowOut(BaseModel):
    room_id: int
    room_name: str
    current_time: datetime
    lesson: Optional[DoorLesson] = None


class ClassScheduleLesson(BaseModel):
    lesson_number: int
    title: str
    start_time: time
    end_time: time
    room_id: int
    room_name: str


class ClassScheduleOut(BaseModel):
    class_id: int
    date: date
    lessons: list[ClassScheduleLesson]


class CheckinCreate(BaseModel):
    nfc_uid: str
    device_key: str


class CheckinStudent(BaseModel):
    id: int
    full_name: str
    class_id: int


class CheckinOut(BaseModel):
    ok: bool
    student: Optional[CheckinStudent]
    status: str
    arrival_time: datetime
    late_by_minutes: int


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MediaOut(BaseModel):
    id: int
    type: str
    filename: str
    url: str
    is_active: bool
    created_at: datetime


class CheckinAnalyticsOut(BaseModel):
    id: int
    arrival_at: datetime
    status: str
    late_by_minutes: int
    nfc_uid: str
    student: Optional[CheckinStudent]
    device_id: int
