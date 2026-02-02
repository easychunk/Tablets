from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from config import settings


def _build_db_url() -> str:
    user = settings.db_user
    password = settings.db_password
    host = settings.db_host
    port = settings.db_port
    name = settings.db_name
    return f"mysql+pymysql://{user}:{password}@{host}:{port}/{name}"


engine = create_engine(_build_db_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
