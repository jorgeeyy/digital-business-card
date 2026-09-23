from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    display_name: Optional[str] = None

    model_config = {"from_attributes": True}


class CardCreate(BaseModel):
    config: str
    html: str


class CardUpdate(BaseModel):
    config: str
    html: str


class PublishRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9][a-z0-9_-]*$")


class CardOut(BaseModel):
    id: int
    config: str
    html: str
    published: bool
    username: Optional[str] = None
    public_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UsernameAvailable(BaseModel):
    available: bool


class UploadResponse(BaseModel):
    url: str
