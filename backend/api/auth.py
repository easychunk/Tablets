from fastapi import APIRouter, HTTPException, status

from config import settings
from schemas import LoginRequest, TokenResponse
from security import create_access_token

router = APIRouter(prefix="/api/admin", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    if (
        payload.username != settings.admin_username
        or payload.password != settings.admin_password
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(settings.admin_username)
    return TokenResponse(access_token=token)
