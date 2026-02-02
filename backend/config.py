from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    db_host: str = Field("db", alias="DB_HOST")
    db_port: int = Field(3306, alias="DB_PORT")
    db_name: str = Field("tablets", alias="DB_NAME")
    db_user: str = Field("tablets", alias="DB_USER")
    db_password: str = Field("tablets", alias="DB_PASSWORD")

    admin_username: str = Field("admin", alias="ADMIN_USERNAME")
    admin_password: str = Field("admin", alias="ADMIN_PASSWORD")

    jwt_secret: str = Field("dev-secret", alias="JWT_SECRET")
    jwt_algorithm: str = Field("HS256", alias="JWT_ALGORITHM")
    jwt_exp_minutes: int = Field(480, alias="JWT_EXP_MINUTES")

    timezone: str = Field("Europe/Vienna", alias="TIMEZONE")
    grace_minutes: int = Field(5, alias="GRACE_MINUTES")
    school_start_time: str | None = Field(None, alias="SCHOOL_START_TIME")

    media_dir: str = Field("/app/media", alias="MEDIA_DIR")
    media_url_prefix: str = Field("/media", alias="MEDIA_URL_PREFIX")


settings = Settings()
