from sqlalchemy import Column, DateTime, Enum, ForeignKey, BigInteger, Integer, String, Time, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)
    location = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    devices = relationship("Device", back_populates="room")


class ClassGroup(Base):
    __tablename__ = "classes"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)
    is_active = Column(Boolean, nullable=False, default=True)

    students = relationship("Student", back_populates="class_group")


class Student(Base):
    __tablename__ = "students"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    full_name = Column(String(120), nullable=False)
    class_id = Column(BigInteger, ForeignKey("classes.id"), nullable=False)
    nfc_uid = Column(String(64), nullable=False, unique=True)
    is_active = Column(Boolean, nullable=False, default=True)

    class_group = relationship("ClassGroup", back_populates="students")
    checkins = relationship("Checkin", back_populates="student")


class BellTime(Base):
    __tablename__ = "bell_times"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    weekday = Column(Integer, nullable=False)
    lesson_number = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    weekday = Column(Integer, nullable=False)
    class_id = Column(BigInteger, ForeignKey("classes.id"), nullable=False)
    room_id = Column(BigInteger, ForeignKey("rooms.id"), nullable=False)
    lesson_number = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False)

    class_group = relationship("ClassGroup")
    room = relationship("Room")


class Device(Base):
    __tablename__ = "devices"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    device_key = Column(String(64), nullable=False, unique=True)
    type = Column(Enum("door", "entrance", "tv"), nullable=False)
    room_id = Column(BigInteger, ForeignKey("rooms.id"), nullable=True)
    last_seen_at = Column(DateTime, nullable=True)

    room = relationship("Room", back_populates="devices")
    checkins = relationship("Checkin", back_populates="device")


class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    student_id = Column(BigInteger, ForeignKey("students.id"), nullable=True)
    nfc_uid = Column(String(64), nullable=False)
    device_id = Column(BigInteger, ForeignKey("devices.id"), nullable=False)
    arrival_at = Column(DateTime, nullable=False)
    status = Column(Enum("on_time", "late"), nullable=False)
    late_by_minutes = Column(Integer, nullable=False, default=0)

    student = relationship("Student", back_populates="checkins")
    device = relationship("Device", back_populates="checkins")


class Media(Base):
    __tablename__ = "media"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    type = Column(Enum("video"), nullable=False)
    filename = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)
    duration_sec = Column(Integer, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
